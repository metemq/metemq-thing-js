import mqtt = require('mqtt');
import _ = require('underscore');
import MqttEmitter = require('mqtt-emitter');
import { mkString, parseValue, genMsgId } from './utils';
import { Subscription } from './Subscription';
import { ThingOptions, DEFAULT_THING_OPTIONS } from './thingOptions';
import { Binding } from './binding';
import { Action, ActionManager } from './action/action';

/**
 * Thing class
 */
export class Thing {

  /**
   * Member Variables
   */
  id: string;
  username: string;
  mqttClient: mqtt.Client;
  mqttEmitter = new MqttEmitter();

  private actionManager: ActionManager;

  /**
   * Constructor
   */
  constructor(thingId: string, options?: ThingOptions) {
      if (typeof thingId !== 'string')
          throw new Error('Type of thingId should be string');

      options = _.extend(DEFAULT_THING_OPTIONS, options);
      this.initialize(thingId, options);
  }

  /**
   * Function for initialize thing's ID, Username, and MQTT Client
   */
  private initialize(thingId, options: ThingOptions) {
      this.id = thingId;
      this.username = options.username;

      this.actionManager = new ActionManager(this);

      this.mqttClient = mqtt.connect(options.url, {
          clientId: thingId,
          username: options.username,
          password: options.password
      });

      this.setDefaultListener();

      this.mqttClient.on('message', (topic, messageBuf) => {
          const payload = messageBuf.toString();
          this.mqttEmitter.emit(topic, payload);
      });
  }

  /**
   * Function for handling default topics
   *
   */
  private setDefaultListener() {
      this.mqttClient.subscribe(`${this.id}/$suback/#`);
      this.mqttClient.subscribe(`${this.id}/$callack/#`);

      this.mqttClient.subscribe(`${this.id}/$inbox/#`);
      this.actionSubscribe();
  }

  /**
   * Function same with 'this.mqttClient.on'
   *
   * @return Thing
   */
  on(event: string, listener: Function): Thing {
      this.mqttClient.on(event, listener);
      return this;
  }

  /**
   * Function for MQTT subscription a publication
   *
   * @param {string} name - what this thing is subscribing
   * @param {...object} [args] - options for subscribing or callback
   * @return Subscription
   */
  subscribe(name: string, ...args: any[]): Subscription {
      if (typeof name !== 'string')
          throw new Error('publish name should be string!');

      let callback;
      if (args && args.length > 0 && typeof args[args.length - 1] == 'function')
          callback = args.pop();

      // MQTT subscribe, and then DDMQ subscribe
      this.twoPhaseSubscribe(name, args, callback);
      // after reconnection, it needs to request supscription again
      this.on('reconnect', () => this.twoPhaseSubscribe(name, args, callback));

      return new Subscription(this, name);
  }

  private twoPhaseSubscribe(name, params: any[], callback?: Function) {
      this.mqttSubscribe(name, () => this.ddmqSubscribe(name, params, callback));
  }

  private mqttSubscribe(name: string, callback?: Function) {
      this.mqttClient.subscribe(`${this.id}/${name}/#`, (err, granted) => {
          // fired on MQTT suback
          // ex) granted : [{ topic: 'myThing01/$inbox/#', qos: 0 }]
          // (granted[0].qos is 128 on error)
          if (err || granted[0].qos > 2)
              throw new Error(`Subscription "${name}" fail: MQTT subscription fail`);
          if (typeof callback === 'function') callback();
      });
  }

  /**
   * Function for DDMQ Subscription
   *
   * @param {string} name - what this thing is subscribing
   * @param {object} [args] - options for subscribing
   * @param {function} [callback] - callback
   */
  private ddmqSubscribe(name: string, args: any[], callback?: Function) {
      this.mqttClient.publish(`${this.id}/$sub/${name}`, mkString(args));

      this.mqttEmitter.once(`${this.id}/$suback/${name}`, (payload) => {
          const code = Number(payload);
          if (code) throw new Error('Subscription refused');
          if (typeof callback === 'function') callback();
      });
  }

  /**
   * Function to MQTT unsubscribe
   *
   * @param {string} name - what this thing is unsubscribing
   * @param {function} [callback] - callback
   * @return null
   */
  unsubscribe(name: string, callback?: Function): void {
      if (typeof name !== 'string')
          throw new Error('publish name should be string!');

      let topic = `${this.id}/${name}/#`;

      this.mqttClient.unsubscribe(topic, callback)
  }

  /**
   * Method Call
   * (MeteMQ Remote Procedure Call)
   * A Job what Thing requests to MeteMQ-Server
   *
   * @param {string} method
   * @param {...object} [args] - options for method or callback
   * @return null
   */
  call(method: string, ...args) {
      const msgId = genMsgId(8);

      let callback;
      if (args && args.length > 0 && typeof args[args.length - 1] == 'function')
          callback = args.pop();

      this.mqttClient.publish(`${this.id}/$call/${method}/${msgId}`, mkString(args));

      this.mqttEmitter.once(`${this.id}/$callack/${msgId}/+code`, (payload, params) => {
          const code = Number(params.code);
          if (code)
              throw new Error(`Method ${method} call refused: error code [${params.code[0]}]`);
          if (typeof callback === 'function')
              callback(parseValue(payload));
      });
  }

  /**
   * 4-Way data binding
   *
   * @param {string} field
   * @param {function} [updateFunction]
   * @return Thing
   */
  bind(field: string, updateFunction?: Function): Binding {
      if (!updateFunction) updateFunction = (value) => { return value; };
      return new Binding(field, updateFunction, this);
  }



  /**
   * Set Action Function
   *
   * A Job what Client requests to Thing
   * usage:
   *   thing.action({
   *     sayHi() { console.log("Hi!") }
   *   });
   */
  actions(actions: { [action: string]: Function }) {
    for(const actionName in actions) {
      const action = actions[actionName];
      this.actionManager.submitAction(actionName, action);
    }
  }

  private actionSubscribe() {
    this.mqttEmitter.on(`${this.id}/$inbox/#`, (payload, params) => {
      payload = parseValue(payload);

      let msgId = payload[0];
      let actionName = payload[1];
      let value = parseValue(payload[2]);

      this.actionManager.actionCall(actionName, msgId, value);
    });
  }


}

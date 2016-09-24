import mqtt = require('mqtt');
import _ = require('underscore');
import MqttEmitter = require('mqtt-emitter');
import { stringifyJSON, parseJSON, genMsgId } from './utils';
import { Subscription, SubscribeTopicOptions } from './Subscription';
import { ThingOptions, DEFAULT_THING_OPTIONS } from './thingOptions';
import { Binding } from './binding';

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
     * Function for handle default topics
     */
    private setDefaultListener() {
        this.mqttClient.subscribe(`${this.id}/$suback/#`);
        this.mqttClient.subscribe(`${this.id}/$callack/#`);
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
     * @param {string} publishName - what this thing is subscribing
     * @param {...object} [optionsOrCallback] - options for subscribing or callback
     * @param {function} [callback] - callback
     * @return Thing.Subscription
     * @example subscribeTopic('mPublishName');
     * @example subscribeTopic('mPublishName', { event: 'added' });
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
            // ex) args : [{ topic: 'myThing01/$inbox/#', qos: 0 }]
            // (args[0].qos is 128 on error)
            if (err || granted[0].qos > 2)
                throw new Error(`Subscription "${name}" fail: MQTT subscription fail`);
            if (typeof callback === 'function') callback();
        });
    }

    /**
     * Function for DDMQ Subscription
     *
     * @param {string} publishName - what this thing is subscribing
     * @param {object} [options] - options for subscribing
     * @param {function} [callback] - callback
     * @return void
     * @example DDMQSubscribeTopic('mPublishName');
     * @example DDMQSubscribeTopic('mPublishName', { event: 'added' });
     */
    private ddmqSubscribe(name: string, params: any[], callback?: Function) {
        this.mqttClient.publish(`${this.id}/$sub/${name}`, stringifyJSON(params));

        this.mqttEmitter.once(`${this.id}/$suback/${name}`, (payload) => {
            const code = Number(payload);
            if (code) throw new Error('Subscription refused');
            if (typeof callback === 'function') callback();
        });
    }

    /**
     * Function to MQTT unsubscribe
     *
     * @param {string} publishName - what this thing is unsubscribing
     * @param {function} [callback] - callback
     * @return void
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
     *
     * @param {string} method
     * @param {...object} [optionsOrCallback] - options for method or callback
     * @return
     */
    call(method, ...args) {
        const msgId = genMsgId(8);

        let callback;
        if (args && args.length > 0 && typeof args[args.length - 1] == 'function')
            callback = args.pop();

        this.mqttClient.publish(`${this.id}/$call/${method}/${msgId}`, stringifyJSON(args));

        this.mqttEmitter.once(`${this.id}/$callack/${msgId}/+code`, (payload, params) => {
            const code = Number(params.code);
            if (code)
                throw new Error(`Method ${method} call refused: error code [${params.code[0]}]`);
            if (typeof callback === 'function')
                callback(parseJSON(payload));
        });
    }

    /**
     * 4-Way data binding
     *
     * @param {string} field
     * @param {object} value
     * @param {function} [callback]
     * @return Thing
     */
    bind(field: string, updateFunction?: Function): Binding {
        if (!updateFunction) updateFunction = (value) => { return value; };
        return new Binding(field, updateFunction, this);
    }
}

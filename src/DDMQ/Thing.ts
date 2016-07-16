import * as mqtt from 'mqtt';
import { mkString } from './utils';
import { Subscription, SubscribeTopicOptions } from './Subscription';

/**
 * Thing class
 */
export class Thing{

  /**
   * Member Variables
   */
  client   :mqtt.Client;

  thingId  :string;
  userName :string;

  /**
   * Constructor
   */
  constructor( thingId, userName, password, host ){

    this.thingId  = thingId;
    this.userName = userName;

    this.client = mqtt.connect( host, {
        clientId : thingId,
        username : userName,
        password : password
    });
  }

  /**
   * a Function same with 'this.client.on'
   * @return Thing
   */
  on( event :string, listener :Function ) :Thing{
    this.client.on( event, listener );
    return this;
  }

  /**
   * Function for MQTT subscription a publication
   *
   * @param {string} publishName - what this thing is subscribing
   * @param {object} [optionsOrCallback] - options for subscribing or callback
   * @param {function} [callback] - callback
   * @return Thing.Subscription
   * @example subscribeTopic('mPublishName');
   * @example subscribeTopic('mPublishName', { event: 'added' });
   */
  subscribe( publishName :string, ...payload :any[] ) :Subscription{
    if( typeof publishName !== 'string' )
      throw new Error( 'publish name should be string!' );

    let callback = null;
    if (payload && payload.length > 0 && typeof payload[payload.length-1] == 'function')
      callback = payload.pop();

    let thingId = this.thingId;
    let topic   = `${ thingId }/${ publishName }/#`;

    let subscription = new Subscription(this, publishName);

    this.on('connect', () => {
      this.client.subscribe( topic, (err, args) => {
        // fired on $suback
        // ex) args : [{ topic: 'myThing01/$inbox/#', qos: 0 }]
        // (args[0].qos is 128 on error)
        if (err || args[0].qos > 2){
          console.log(`subscription "${topic}" failure : ${err}`);
        }else{
          this.DDMQSubscribe( publishName, mkString(payload), callback );
        }
      });
    });

    return subscription;
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
  private DDMQSubscribe( publishName :string, payload: string, callback? ) {

    let thingId    = this.thingId;
    let topic      = `${ thingId }/$sub/${ publishName }`;

    this.client.publish( topic, payload, callback );
  }

  /**
   * Function to MQTT unsubscribe
   *
   * @param {string} publishName - what this thing is unsubscribing
   * @param {function} [callback] - callback
   * @return void
   */
  unsubscribe( publishName :string, callback? :Function ) :void{
    if( typeof publishName !== 'string' )
      throw new Error( 'publish name should be string!' );

    let thingId = this.thingId;
    let topic   = `${ thingId }/${ publishName }/#`;

    this.client.unsubscribe( topic, callback )
  }

 /**
  * Function for MQTT publication
  *
  * @param {string} publishName - what this thing is publishing
  * @param {string} payload - publication payload
  * @return Thing
  * @example publish(`Hello`, `World! [${i++}]`);
  */
  publish(publishName :string, payload :string, callback? :Function) :Thing{
    this.client.publish(`${this.thingId}/${publishName}`, `${payload}`, callback);

    return this;
  }

}

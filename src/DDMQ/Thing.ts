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
  thingId    :string;
  userName   :string;
  mqttClient :mqtt.Client;

  /**
   * Constructor
   */
  constructor( thingId, userName, password, host ){
    this.initialize( thingId, userName, password, host );
    this.setDefaultListener();
  }

  /**
   * Function for initialize thing's ID, Username, and MQTT Client
   */
  private initialize( thingId, userName, password, host ){
    this.thingId  = thingId;
    this.userName = userName;

    this.mqttClient = mqtt.connect( host, {
      clientId : thingId,
      username : userName,
      password : password
    });
  }

  /**
   * Function for handle default topics
   */
  private setDefaultListener( ){
    //TODO sub $inbox
  }

  /**
   * Function same with 'this.mqttClient.on'
   * @return Thing
   */
  on( event :string, listener :Function ) :Thing{
    this.mqttClient.on( event, listener );
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

    this.on('connect', ( ) => {
      this.mqttClient.subscribe( topic, (err, args) => {
        // fired on $suback
        // ex) args : [{ topic: 'myThing01/$inbox/#', qos: 0 }]
        // (args[0].qos is 128 on error)
        if (err || args[0].qos > 2){
          console.log( `subscription "${topic}" failure : ${err}` );
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
  private DDMQSubscribe( publishName :string, payload: string, callback? ){

    let thingId    = this.thingId;
    let topic      = `${ thingId }/$sub/${ publishName }`;

    this.mqttClient.publish( topic, payload, callback );
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

    this.mqttClient.unsubscribe( topic, callback )
  }

 /**
  * Function for MQTT publication
  *
  * @param {string} publishName - what this thing is publishing
  * @param {string} payload - publication payload
  * @return Thing
  * @example publish(`Hello`, `World! [${i++}]`);
  */
  publish(publishName :string, payload :string, callback? :Function ) :Thing{
    this.mqttClient.publish( `${this.thingId}/${publishName}`, `${payload}`, callback );

    return this;
  }

}

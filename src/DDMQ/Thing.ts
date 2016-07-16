import * as mqtt from 'mqtt';
import { mkString } from './utils';
//import { ThingSubscription } from './ThingsSubscription';

export module Thing {
  /**
   * Options for MQTT subscription for a topic
   */
  interface SubscribeTopicOptions{
    collection? :string;
    documentId? :string;
    field?      :string;
    event?      :string;
    payload?    :string;
  }

  /**
   * Class for DDMQ Subscription
   *
   * member methods:
   *   onadded (func :Function)
   *   onchanged (func :Function)
   *   onremoved (func :Function)
   *   onevent (ev :string, func :Function)
   */
  export class Subscription{
    client      :Client;
    publishName :String;

    constructor( client :Client, publishName :string ){
      this.client      = client;
      this.publishName = publishName;
    }

    /**
     * Listener for Added event
     * @param {Function} function
     * @return Thing.Subscription
     */
    onadded( func :Function ) :Thing.Subscription{
      this.onevent( 'added', func );
      return this;
    }

    /**
     * Listener for Changed event
     * @param {Function} function
     * @return Thing.Subscription
     */
    onchanged( func :Function ) :Thing.Subscription{
      this.onevent( 'changed', func );
      return this;
    }

    /**
     * Listener for Removed event
     * @param {Function} function
     * @return Thing.Subscription
     */
    onremoved( func :Function ) :Thing.Subscription{
      this.onevent( 'removed', func );
      return this;
    }

    /**
     * Listener for Added event
     * @param {string} ev
     * @param {Function} function
     * @return Thing.Subscription
     */
    onevent( ev :string, func :Function ) :Thing.Subscription{
      this.client.on('message', (topic, messageBuf) => {
        let msg = messageBuf.toString();
        let topicSplit = topic.split('/');

        if ((topicSplit[1] === this.publishName || this.publishName == '+')
         && topicSplit[4] === ev) {
          func(topic, msg);
        }
      });
      return this;
    }

    /**
     * Listener for ANY event
     * @param {Function} function
     * @return Thing.Subscription
     */
    on( func :Function ) :Thing.Subscription{
        this.client.on('message', (topic, messageBuf) => {
          let msg = messageBuf.toString();
          let topicSplit = topic.split('/');
          let publishNameSplit = this.publishName.split('/');

          for (let i=1; i<topic.split.length && this.publishName != '+'; i++) {
            if (topicSplit[i] != publishNameSplit[i-1]) return; 
          }

          func(topic, msg);
        });
        return this;
    }
  }

  /**
   * Thing class
   */
  export class Client{

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
     * @return Thing.Client
     */
    on( event :string, listener :Function ) :Thing.Client{
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
    subscribe( publishName :string, ...payload :any[] ) :Thing.Subscription{
      if( typeof publishName !== 'string' )
        throw new Error( 'publish name should be string!' );

      let callback = null;
      if (payload && payload.length > 0 && typeof payload[payload.length-1] == 'function')
        callback = payload.pop();

      let thingId = this.thingId;
      let topic   = `${ thingId }/${ publishName }/#`;

      let subscription = new Thing.Subscription(this, publishName);

      this.on('connect', () => {
        this.client.subscribe( topic, (err, args) => {
          // fired on $suback
          // ex) args : [{ topic: 'myThing01/$inbox/#', qos: 0 }]
          // (args[0].qos is 128 on error)
          if (err || args[0].qos > 2)
            console.log(`subscription "${topic}" failure : ${err}`);
          else
            this.DDMQSubscribe( publishName, mkString(payload), callback );
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
    * @return Thing.Client
    * @example publish(`Hello`, `World! [${i++}]`);
    */
    publish(publishName :string, payload :string, callback? :Function) :Thing.Client{
      this.client.publish(`${this.thingId}/${publishName}`, `${payload}`, callback);

      return this;
    }

  }
}

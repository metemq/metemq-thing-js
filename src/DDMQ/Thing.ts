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
   */
  export class Subscription {
    topic   :string;
    payload :string;

    constructor(){
    }

    onadded() {
    }

    onchanged() {
    }

    onremoved() {
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

      let subscription = new Thing.Subscription();

      this.client.subscribe( topic, (err, args) => {
        // fired on $suback
        // ex) args : [{ topic: 'myThing01/$inbox/#', qos: 0 }]

        if (err || args[0].qos > 2)
          console.log(`subscription "${topic}" failure : ${err}`);
        else
          this.DDMQSubscribe( publishName, mkString(payload), callback );
      } );

      return subscription;
    }
    /*subscribe( publishName :string, optionsOrCallback? :SubscribeTopicOptions,
        payload? :Array<string>, callback? ) :Thing{
      if( typeof publishName !== 'string' )
        throw new Error( 'publish name should be string!' );
      if( typeof payload === 'function')
        callback = payload;
      if( typeof optionsOrCallback === 'function')
        callback = optionsOrCallback;
      if( callback && typeof callback !== 'function')
        throw new Error( 'callback should be function!' );

      let thingId    = this.options.clientId;
      let collection = optionsOrCallback.collection || "+";
      let documentId = optionsOrCallback.documentId || "+";
      let field      = optionsOrCallback.field      || "+";
      let event      = optionsOrCallback.event      || "+";

      let topic      = `${ thingId    }/${ publishName }/${ collection }/`
                     + `${ documentId }/${ field       }/${ event      }`;

      this.client.subscribe( topic, (code) => {
        this.DDMQSubscribe(publishName, payload, callback );
      } );

      return this;
    }*/

    /**
     * Function for DDMQ Subscription
     *
     * @param {string} publishName - what this thing is subscribing
     * @param {object} [options] - options for subscribing
     * @param {function} [callback] - callback
     * @return Thing
     * @example DDMQSubscribeTopic('mPublishName');
     * @example DDMQSubscribeTopic('mPublishName', { event: 'added' });
     */
    private DDMQSubscribe( publishName :string, payload: string, callback? ) {

      let thingId    = this.thingId;
      let topic      = `${ thingId }/$sub/${ publishName }`;

      this.client.publish( topic, payload, callback );

      console.log('payload: '+payload);
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

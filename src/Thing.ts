import * as mqtt from 'mqtt';

/**
 * Options for MQTT subscription for a topic
 */
export interface SubscribeTopicOptions{
  collection? :string;
  documentId? :string;
  field?      :string;
  event?      :string;
  payload?    :string;
}

/**
 * Thing class
 */
export class Thing{

  /**
   * Member Variables
   */
  client  :mqtt.Client;
  options :mqtt.ClientOptions;

  /**
   * Constructor
   */
   constructor( thingId, userName, password, host ){

     this.options = {
         clientId :thingId,
         username :userName,
         password :password
     }

     this.client = mqtt.connect( host, this.options );
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
   * @return Thing
   * @example subscribeTopic('mPublishName');
   * @example subscribeTopic('mPublishName', { event: 'added' });
   */
  subscribe( publishName :string, optionsOrCallback? :SubscribeTopicOptions, callback? ) :Thing{
    if( typeof publishName !== 'string' )
      throw new Error( 'publish name should be string!' )
    if( typeof optionsOrCallback === 'function')
      callback = optionsOrCallback;
    if( callback && typeof callback !== 'function')
      throw new Error( 'callback should be function!' )

    let thingId = this.options.clientId;
    let topic   = `${ thingId }/${ publishName }/#`;

    this.client.subscribe( topic, () => {
      this.DDMQSubscribe(publishName, optionsOrCallback||{}, callback );
    } );

    return this;
  }

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
  private DDMQSubscribe( publishName :string, options :SubscribeTopicOptions, callback? :Function ) :Thing{
    if( typeof publishName !== 'string' )
      throw new Error( 'publish name should be string!' )

    let thingId    = this.options.clientId;
    let collection = options.collection || "+";
    let documentId = options.documentId || "+";
    let field      = options.field      || "+";
    let event      = options.event      || "+";
    let payload    = options.payload    || null;

    let topic      = `${ thingId }/$sub/${ publishName }/${ collection }/`
                   + `${ documentId   }/${ field       }/${ event      }`;

    this.client.publish( topic, payload, callback );

    return this;
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
    this.client.publish(`${this.options.clientId}/${publishName}`, `${payload}`, callback);

    return this;
  }

}

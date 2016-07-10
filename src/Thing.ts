import * as mqtt from 'mqtt';
import {THING_ID, USER_NAME, PASSWORD, HOST} from './config';

/**
 * Options for MQTT subscription for a topic
 *
 * format of topic for subscribing is
 * ":thingId/:publish_name/:collection/:document_id/:field/:event"
 */
export interface SubscribeTopicOptions{
  collection?: string;
  documentId?: string;
  field?     : string;
  event?     : string;
  payload?   : string;
}

/**
 * Thing class
 */
export class Thing {

  /**
   * Member Variables
   */
  client : mqtt.Client;
  options: mqtt.ClientOptions;

  /**
   * Constructor
   */
   constructor(thingId, userName, password, host){

     this.options = {
         clientId: thingId,
         username: userName,
         password: password
     }

     this.client = mqtt.connect(host, this.options);

   }

   /**
    * a Function same with 'this.client.on'
    */
   on( event: string, listener: Function ) {
     this.client.on(event, listener);
   }

  /**
   * Function for MQTT subscribing a publication
   *
   * @param {string} publishName - what this thing is going to subscribe
   * @example subscribe('mPublishName');
   */
  subscribe( publishName :string ) :void{
    if( typeof publishName !== 'string' )
      throw new Error( 'publish name should be string!' )

    let topic= `${THING_ID}/${publishName}/#`;

    this.client.subscribe( topic );
  }

  /**
   * Function for MQTT subscribing a topic
   *
   * @param {string} publishName - what this thing is subscribing
   * @param {Array} [options] - options for subscribing
   * @example subscribeTopic('mPublishName');
   * @example subscribeTopic('mPublishName', { event: 'added' });
   */
  subscribeTopic( publishName :string, options? :SubscribeTopicOptions ) :void{
    if( typeof publishName !== 'string' )
      throw new Error( 'publish name should be string!' )

    let collection= options.collection || "+";
    let documentId= options.documentId || "+";
    let field     = options.field      || "+";
    let event     = options.event      || "+";
    let payload   = options.payload    || null;

    let topic     = `${ THING_ID   }/${ publishName }/${ collection }/`
                  + `${ documentId }/${ field       }/${ event      }`;

    this.client.publish( topic, payload );
  }

}

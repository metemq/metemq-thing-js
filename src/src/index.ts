import * as mqtt from 'mqtt';
import {THING_ID, USER_NAME, PASSWORD, HOST} from './config';

const options: mqtt.ClientOptions = {
    clientId: THING_ID,
    username: USER_NAME,
    password: PASSWORD
}

const client = mqtt.connect(HOST, options);

let intervalObject;

client.on('connect', function() {
    client.subscribe(`${THING_ID}/$inbox/#`);

    sayHello();
    intervalObject = setInterval(sayHello, 1000);
});

client.on('message', function(topic, messageBuf) {
    let msg = messageBuf.toString()
    console.log(`${topic}: ${msg}`);
});

client.on('close', () => {
    if (intervalObject) clearInterval(intervalObject);
})

let i = 0;
function sayHello() {
    client.publish(`${THING_ID}/Hello`, `World! [${i++}]`);
}


/**
 * Options for MQTT subscribing
 *
 * format of topic for subscribing is
 * ":thingId/:publish_name/:collection/:document_id/:field/:event"
 */
interface SubscribeOptions{
  collection? :string;
  documentId? :string;
  field?      :string;
  event?      :string;
}

/**
 * Function for MQTT subscribing a topic
 *
 * @param publishName  the publish-name that this thing want to subscribe
 * @param options?     options for subscribing
 */
function subscribe( publishName :string, options? :SubscribeOptions ) {
  if( typeof publishName !== 'string' )
    throw new Error( 'publish name should be string!' )

  // parameters
  let collection = options.collection || "+";
  let documentId = options.documentId || "+";
  let field      = options.field      || "+";
  let event      = options.event      || "+";

  let topic      = `${THING_ID}/${publishName}/${collection}/${documentId}/${field}/${event}`;

  // subscribe
  client.subscribe( topic );
}

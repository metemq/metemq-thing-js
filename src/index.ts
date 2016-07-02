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

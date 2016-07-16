
import { THING_ID, USER_NAME, PASSWORD, HOST } from './config';
import { Thing } from './DDMQ/Thing';

let thing = new Thing.Client (THING_ID, USER_NAME, PASSWORD, HOST);

let intervalObject;
if (!intervalObject) {
  intervalObject = setInterval(sayHello, 1000);
}

let i = 0;
function sayHello() {
   thing.publish(`Hello`, `World! [${i++}]`);
}

let sub = thing.subscribe("$inbox/Hi", 1, 2, 4);
sub.on((topic, msg) => {
  console.log(`received - ${topic}: ${msg}`);
});

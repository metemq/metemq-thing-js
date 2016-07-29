import { THING_ID, USER_NAME, PASSWORD, HOST } from './config';
import { Thing } from './DDMQ/Thing';

// initialize thing-js
let thing = new Thing(THING_ID, USER_NAME, PASSWORD, HOST);

// subscribe
let sub = thing.subscribe('$inbox', 1, 2, 4);

// handle on any event
sub.onAny((msg) => {
    console.log(`received - ${msg}`);
});


// sample code
let i = 0;
let intervalObject = setInterval(sayHello, 1000);

function sayHello() {
    thing.publish(`Hello`, `World! [${i++}]`);
}

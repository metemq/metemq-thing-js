
import { THING_ID, USER_NAME, PASSWORD, HOST } from './config';
import { Thing } from './Thing';


let thing = new Thing(THING_ID, USER_NAME, PASSWORD, HOST);

let intervalObject;

thing.on('connect', function() {
    thing.subscribe('$inbox', ()=>{ console.log("subscribe $inbox !!"); });

    sayHello();
    intervalObject = setInterval(sayHello, 1000);
});

thing.on('message', function(topic, messageBuf) {
    let msg = messageBuf.toString()
    console.log(`${topic}: ${msg}`);
});

thing.on('close', () => {
    if (intervalObject) clearInterval(intervalObject);
})

let i = 0;
function sayHello() {
   thing.publish(`Hello`, `World! [${i++}]`, ()=>{ console.log(`say hello world! ${i}`); });
}

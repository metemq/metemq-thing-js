
import { THING_ID, USER_NAME, PASSWORD, HOST } from './config';
import { Thing } from './DDMQ/Thing';

let thing = new Thing.Client (THING_ID, USER_NAME, PASSWORD, HOST);

let intervalObject;

thing.on('connect', ()  => {
    if (!intervalObject) {
        intervalObject = setInterval(sayHello, 1000);
    }
}).on('message', (topic, messageBuf) => {
    let msg = messageBuf.toString()
    console.log(`${topic}: ${msg}`);

}).on('close', () => {
    if (intervalObject) {
        clearInterval(intervalObject);
        intervalObject = null;
        console.log("closed");
    }
})

let sub = thing.subscribe("+");
sub.onadded(( topic, msg )=>{
  console.log(`topic:${topic}, message:${msg}`);
});

let i = 0;
function sayHello() {
   thing.publish(`Hello`, `World! [${i++}]`, ()=>{ console.log(`say hello world! ${i}`); });
}

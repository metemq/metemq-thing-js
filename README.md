# MeteMQ Thing JS
MeteMQ Thing library for Node.js

# Getting Started

Install MeteMQ Thing JS package

```bash
npm i --save metemq-thing-js
```

```js
var Thing = require('metemq-thing-js').Thing;
var thing = new Thing('MY_FIRST_METEMQ_THING_JS');

var sub = thing.subscribe('demo')

sub.on({
    added(name, age) {
        console.log(`${name}(${age})`);
    }
});

thing.call('hello', function(result) {
    console.log(`hello ${result}!`);
});

const temp = thing.bind('temp');

setInterval(function() {
    temp.set(Math.random());
}, 2000);

thing.actions({
  print(c, ...args){
    console.log(`message from server: ${args}`);
    c.done();
  }
})
```

# How to test?

```bash
npm test
```

Or, in order to watch

```bash
gulp watch
```

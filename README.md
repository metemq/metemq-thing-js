# MeteMQ Thing JS
MeteMQ Thing library for Node.js

# Getting Started

Install MeteMQ Thing JS package

```bash
npm i --save metemq-thing-js
```

```js
var Thing = require('metemq-thing-js').Thing;
var thing = new Thing('myFirstThing');

var sub = thing.subscribe('demo')
sub.onAdded(function(name, age) {
    console.log(`${name}(${age})`);
});

thing.call('hello', function(value) {
    console.log(value)
});

const temp = thing.bind('temp');
temp.set(30);
```

# How to test?

```bash
npm test
```

Or, in order to watch

```bash
gulp watch
```

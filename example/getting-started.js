var Thing = require('..').Thing;
var thing = new Thing('t01');

var sub = thing.subscribe('demo')
sub.onAdded(function(name, age) {
    console.log(`${name}(${age})`);
});

thing.call('hello', function(value) {
    console.log(value)
});

const temp = thing.bind('temp');
temp.set(30);

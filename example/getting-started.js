var Thing = require('..').Thing;
var thing = new Thing('MY_FIRST_METEMQ_THING_JS');

var sub = thing.subscribe('demo')

sub.on({
  added(name, age){
    console.log(`${name}(${age})`);
  }
});

thing.call('hello', function(value) {
    console.log(value)
});

const temp = thing.bind('temp');
temp.set(30);

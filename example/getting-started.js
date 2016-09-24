var Thing = require('..').Thing;
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

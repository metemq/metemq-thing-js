"use strict";
var config_1 = require('./config');
var Thing_1 = require('./DDMQ/Thing');
// initialize thing-js
var thing = new Thing_1.Thing(config_1.THING_ID, config_1.USER_NAME, config_1.PASSWORD, config_1.HOST);
// subscribe
var sub = thing.subscribe('$inbox', 1, 2, 4);
// handle on any event
sub.onAny(function (msg) {
    console.log("received - " + msg);
});
// sample code
var i = 0;
var intervalObject = setInterval(sayHello, 1000);
function sayHello() {
    thing.publish("Hello", "World! [" + i++ + "]");
}

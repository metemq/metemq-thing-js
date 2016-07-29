"use strict";
var mqtt = require('mqtt');
var config_1 = require('./config');
var options = {
    clientId: config_1.THING_ID,
    username: config_1.USER_NAME,
    password: config_1.PASSWORD
};
var client = mqtt.connect(config_1.HOST, options);
var intervalObject;
client.on('connect', function () {
    client.subscribe(config_1.THING_ID + "/$inbox/#");
    sayHello();
    intervalObject = setInterval(sayHello, 1000);
});
client.on('message', function (topic, messageBuf) {
    var msg = messageBuf.toString();
    console.log(topic + ": " + msg);
});
client.on('close', function () {
    if (intervalObject)
        clearInterval(intervalObject);
});
var i = 0;
function sayHello() {
    client.publish(config_1.THING_ID + "/Hello", "World! [" + i++ + "]");
}
/**
 * Function for MQTT subscribing a topic
 *
 * @param publishName  the publish-name that this thing want to subscribe
 * @param options?     options for subscribing
 */
function subscribe(publishName, options) {
    if (typeof publishName !== 'string')
        throw new Error('publish name should be string!');
    // parameters
    var collection = options.collection || "+";
    var documentId = options.documentId || "+";
    var field = options.field || "+";
    var event = options.event || "+";
    var topic = config_1.THING_ID + "/" + publishName + "/" + collection + "/" + documentId + "/" + field + "/" + event;
    // subscribe
    client.subscribe(topic);
}

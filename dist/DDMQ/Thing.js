"use strict";
var mqtt = require('mqtt');
var utils_1 = require('./utils');
var ThingUtils_1 = require('./ThingUtils');
var Subscription_1 = require('./Subscription');
var Thing = (function () {
    function Thing(thingId, userName, password, host) {
        this.initialize(thingId, userName, password, host);
    }
    Thing.prototype.initialize = function (thingId, userName, password, host) {
        this.thingId = thingId;
        this.userName = userName;
        this.mqttClient = mqtt.connect(host, {
            clientId: thingId,
            username: userName,
            password: password
        });
        this.setDefaultListener();
    };
    Thing.prototype.setDefaultListener = function () {
    };
    Thing.prototype.on = function (event, listener) {
        this.mqttClient.on(event, listener);
        return this;
    };
    Thing.prototype.subscribe = function (publishName) {
        var _this = this;
        var payload = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            payload[_i - 1] = arguments[_i];
        }
        if (typeof publishName !== 'string')
            throw new Error('publish name should be string!');
        var callback = null;
        if (payload && payload.length > 0 && typeof payload[payload.length - 1] == 'function')
            callback = payload.pop();
        var thingId = this.thingId;
        var topic = thingId + "/" + publishName + "/#";
        var subscription = new Subscription_1.Subscription(this, publishName);
        this.on('connect', function () {
            _this.mqttClient.subscribe(topic, function (err, args) {
                if (err || args[0].qos > 2) {
                    console.log("subscription \"" + topic + "\" failure : " + err);
                }
                else {
                    _this.DDMQSubscribe(publishName, utils_1.mkString(payload), callback);
                }
            });
        });
        return subscription;
    };
    Thing.prototype.DDMQSubscribe = function (publishName, payload, callback) {
        var thingId = this.thingId;
        var topic = thingId + "/$sub/" + publishName;
        this.mqttClient.publish(topic, payload, callback);
    };
    Thing.prototype.unsubscribe = function (publishName, callback) {
        if (typeof publishName !== 'string')
            throw new Error('publish name should be string!');
        var thingId = this.thingId;
        var topic = thingId + "/" + publishName + "/#";
        this.mqttClient.unsubscribe(topic, callback);
    };
    Thing.prototype.publish = function (publishName, payload, callback) {
        this.mqttClient.publish(this.thingId + "/" + publishName, "" + payload, callback);
        return this;
    };
    Thing.prototype.call = function (method) {
        var payload = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            payload[_i - 1] = arguments[_i];
        }
        var thingId = this.thingId;
        var msgId = ThingUtils_1.genMsgId(8);
        var callback = null;
        if (payload && payload.length > 0 && typeof payload[payload.length - 1] == 'function')
            callback = payload.pop();
        var topic = thingId + "/$call/" + method + "/" + msgId;
        this.mqttClient.publish(topic, utils_1.mkString(payload), callback);
        return this;
    };
    return Thing;
}());
exports.Thing = Thing;

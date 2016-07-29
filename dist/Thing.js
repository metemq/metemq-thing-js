"use strict";
var mqtt = require('mqtt');
var utils_1 = require('./utils');
/**
 * Thing class
 */
var Thing = (function () {
    /**
     * Constructor
     */
    function Thing(thingId, userName, password, host) {
        this.options = {
            clientId: thingId,
            username: userName,
            password: password
        };
        this.client = mqtt.connect(host, this.options);
    }
    /**
     * a Function same with 'this.client.on'
     * @return Thing
     */
    Thing.prototype.on = function (event, listener) {
        this.client.on(event, listener);
        return this;
    };
    /**
     * Function for MQTT subscription a publication
     *
     * @param {string} publishName - what this thing is subscribing
     * @param {object} [optionsOrCallback] - options for subscribing or callback
     * @param {function} [callback] - callback
     * @return Thing
     * @example subscribeTopic('mPublishName');
     * @example subscribeTopic('mPublishName', { event: 'added' });
     */
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
        var thingId = this.options.clientId;
        var topic = thingId + "/" + publishName + "/#";
        this.client.subscribe(topic, function (err, args) {
            // fired on $suback
            // args = [ { topic: 'myThing01/$inbox/#', qos: 0 } ]
            if (err || args.qos > 2)
                console.log("subscription \"" + topic + "\" failure : " + err);
            else
                _this.DDMQSubscribe(publishName, utils_1.mkString(payload), callback);
        });
        return this;
    };
    /*subscribe( publishName :string, optionsOrCallback? :SubscribeTopicOptions,
        payload? :Array<string>, callback? ) :Thing{
      if( typeof publishName !== 'string' )
        throw new Error( 'publish name should be string!' );
      if( typeof payload === 'function')
        callback = payload;
      if( typeof optionsOrCallback === 'function')
        callback = optionsOrCallback;
      if( callback && typeof callback !== 'function')
        throw new Error( 'callback should be function!' );
  
      let thingId    = this.options.clientId;
      let collection = optionsOrCallback.collection || "+";
      let documentId = optionsOrCallback.documentId || "+";
      let field      = optionsOrCallback.field      || "+";
      let event      = optionsOrCallback.event      || "+";
  
      let topic      = `${ thingId    }/${ publishName }/${ collection }/`
                     + `${ documentId }/${ field       }/${ event      }`;
  
      this.client.subscribe( topic, (code) => {
        this.DDMQSubscribe(publishName, payload, callback );
      } );
  
      return this;
    }*/
    /**
     * Function for DDMQ Subscription
     *
     * @param {string} publishName - what this thing is subscribing
     * @param {object} [options] - options for subscribing
     * @param {function} [callback] - callback
     * @return Thing
     * @example DDMQSubscribeTopic('mPublishName');
     * @example DDMQSubscribeTopic('mPublishName', { event: 'added' });
     */
    Thing.prototype.DDMQSubscribe = function (publishName, payload, callback) {
        var thingId = this.options.clientId;
        var topic = thingId + "/$sub/" + publishName;
        this.client.publish(topic, payload, callback);
        console.log('payload: ' + payload);
        return this;
    };
    /**
     * Function for MQTT publication
     *
     * @param {string} publishName - what this thing is publishing
     * @param {string} payload - publication payload
     * @return Thing
     * @example publish(`Hello`, `World! [${i++}]`);
     */
    Thing.prototype.publish = function (publishName, payload, callback) {
        this.client.publish(this.options.clientId + "/" + publishName, "" + payload, callback);
        return this;
    };
    return Thing;
}());
exports.Thing = Thing;

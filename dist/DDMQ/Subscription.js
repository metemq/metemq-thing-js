"use strict";
var utils_1 = require('./utils');
/**
 * Class for DDMQ Subscription
 *
 * member methods:
 *   onadded (func :Function)
 *   onchanged (func :Function)
 *   onremoved (func :Function)
 *   onEvent (ev :string, func :Function)
 */
var Subscription = (function () {
    function Subscription(client, publishName) {
        this.client = client;
        this.publishName = publishName;
    }
    /**
     * Listener for Added event
     * @param {Function} func
     * @return Subscription
     */
    Subscription.prototype.onAdded = function (func) {
        this.onEvent('$added', func);
        return this;
    };
    /**
     * Listener for Changed event
     * @param {Function} func
     * @return Subscription
     */
    Subscription.prototype.onChanged = function (func) {
        this.onEvent('$changed', func);
        return this;
    };
    /**
     * Listener for Removed event
     * @param {Function} func
     * @return Subscription
     */
    Subscription.prototype.onRemoved = function (func) {
        this.onEvent('$removed', func);
        return this;
    };
    /**
     * Listener for Added event
     * @param {string} ev
     * @param {Function} func
     * @return Subscription
     */
    Subscription.prototype.onEvent = function (ev, func) {
        var _this = this;
        this.client.on('message', function (topic, messageBuf) {
            var msg = messageBuf.toString();
            var topicSplit = topic.split('/');
            if ((topicSplit[1] === _this.publishName || _this.publishName === '+')
                && (topicSplit[2] === ev || topicSplit[2] === '+')) {
                var args = utils_1.parseCSV(msg);
                func.apply(void 0, args);
            }
        });
        return this;
    };
    /**
     * Listener for ANY event
     * @param {Function} function
     * @return Subscription
     */
    Subscription.prototype.onAny = function (func) {
        var _this = this;
        this.client.on('message', function (topic, messageBuf) {
            var msg = messageBuf.toString();
            var topicSplit = topic.split('/');
            if (topicSplit[1] === _this.publishName
                || _this.publishName === '+') {
                var args = utils_1.parseCSV(msg);
                func.apply(void 0, args);
            }
        });
        return this;
    };
    return Subscription;
}());
exports.Subscription = Subscription;

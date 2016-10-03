![MeteMQ](https://raw.githubusercontent.com/metemq/metemq-thing-js/master/METEMQ.png)

[![NPM](https://nodei.co/npm/metemq-thing-js.png)](https://nodei.co/npm/metemq-thing-js/)

# MeteMQ Thing JS
MeteMQ Thing library for Node.js

* [Getting Started](#getting_started)
* [How to test?](#how_to_test)
* [API](#api)

<a name="getting_started"></a>
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

<a name="how_to_test"></a>
# How to test?

```bash
npm test
```

Or, in order to watch

```bash
gulp watch
```


<a name="api"></a>
# API

  * <a href="#constructor"><code><b>Constructor</b></code></a>
  * <a href="#bind"><code>thing.<b>bind()</b></code></a>
  * <a href="#bind_set"><code>thing.bind#<b>set()</b></code></a>
  * <a href="#call"><code>thing.<b>call()</b></code></a>
  * <a href="#actions"><code>thing.<b>actions()</b></code></a>
  * <a href="#subscribe"><code>thing.<b>subscribe()</b></code></a>
  * <a href="#subscribe_onevent"><code>thing.subscribe#<b>onEvent()</b></code></a>
  * <a href="#subscribe_onadded"><code>thing.subscribe#<b>onAdded()</b></code></a>
  * <a href="#subscribe_onchanged"><code>thing.subscribe#<b>onChanged()</b></code></a>
  * <a href="#subscribe_onremoved"><code>thing.subscribe#<b>onRemoved()</b></code></a>
  * <a href="#subscribe_on"><code>thing.subscribe#<b>on()</b></code></a>
  * <a href="#subscribe_onany"><code>thing.subscribe#<b>onAny()</b></code></a>
  * <a href="#subscribe_unsubscribe"><code>thing.subscribe#<b>unsubscribe()</b></code></a>
  * <a href="#unsubscribe"><code>thing.<b>unsubscribe()</b></code></a>

-------------------------------------------------------
<a name="constructor"></a>
### Constructor(thingId: string, options?: ThingOptions)

Initialize New Thing

```javascript
var Thing = require('metemq-thing-js').Thing;

var thing = new Thing('demo_thing', {
  username: 'user01',
  password: 'secret',
  url: 'mqtt://metemq.com'
});
```

-------------------------------------------------------
<a name="bind"></a>
### thing.bind(field: string, updateFunction?: Function): Binding

Data binding

```javascript
var temperBind = thing.bind('temperature');
```

-------------------------------------------------------
<a name="bind_set"></a>
### thing.bind#set(...args)

Set bound data

```javascript
var data = 'data_from_sensor';
temperBind.set(data);
```

-------------------------------------------------------
<a name="call"></a>
### thing.call(method, ...args)

Method Call
(MeteMQ Remote Procedure Call)

```javascript
thing.call('serversFunction');
```

-------------------------------------------------------
<a name="actions"></a>
### thing.actions(actions: { [action: string]: Function })

Set Action Function

```javascript
thing.actions({
  toggleLed(c, params) {
    doSomething(params);
    c.done();
  }
});
```

If you want to represent the __progress__ in percentage,

```javascript
thing.actions({
  toggleLed(c, params) {
    doSomething1(params);
    c.progress(50); // 50% done

    doSomething2(params);
    c.done();
  }
});
```

-------------------------------------------------------
<a name="subscribe"></a>
### thing.subscribe(name: string, ...args: any[]): Subscription

Function for __MQTT subscription__

```javascript
var sub = thing.subscribe('pub_name', function() {
  // successfully subscribed.
});
```

-------------------------------------------------------

<a name="subscribe_onevent"></a>
### thing.subscribe#onEvent(ev: string, func: Function): Subscription

Listener for specific event

```javascript
sub.onEvent("anEvent", function (payload) {
  doSomething(payload);
})
```

-------------------------------------------------------

<a name="subscribe_onadded"></a>
### thing.subscribe#onAdded(func: Function): Subscription

Listener for `Added` event

```javascript
sub.onAdded(function (payload) {
  doSomething(payload);
})
```

-------------------------------------------------------

<a name="subscribe_onchanged"></a>
### thing.subscribe#onChanged(func: Function): Subscription

Listener for `Changed` event

```javascript
sub.onChanged(function (payload) {
  doSomething(payload);
})
```

-------------------------------------------------------

<a name="subscribe_onremoved"></a>
### thing.subscribe#onRemoved(func: Function): Subscription

Listener for `Removed` event

```javascript
sub.onRemoved(function (payload) {
  doSomething(payload);
})
```

-------------------------------------------------------

<a name="subscribe_on"></a>
### thing.subscribe#on(handlers: { added?: Function, changed?: Function, removed?: Function }): Subscription

Listener for three environments - `added`, `changed`, and `removed`

```javascript
sub.on({
  function (payload) {
    doOnAdded (payload);
  },
  function (payload) {
    doOnChanged(payload);
  },
  function (payload) {
    doOnRemoved(payload);
  },
})
```

-------------------------------------------------------

<a name="subscribe_onany"></a>
### thing.subscribe#onAny(func: Function): Subscription

Listener for ANY event

```javascript
sub.onAny(function (payload) {
  doSomething(payload);
})
```

-------------------------------------------------------
<a name="subscribe_unsubscribe"></a>
### thing.subscribe#unsubscribe(callback?: Function)

Function to MQTT unsubscribe

(same with [thing.unsubscribe()](#unsubscribe))

```javascript
sub.unsubscribe(function() {
  // successfully unsubscribed.
});
```

-------------------------------------------------------
<a name="unsubscribe"></a>
### thing.unsubscribe(name: string, callback?: Function)

Function to MQTT unsubscribe

(same with [thing.subscribe#unsubscribe()](#subscribe_unsubscribe))

```javascript
thing.unsubscribe('pub_name', function() {
  // successfully unsubscribed.
});
```

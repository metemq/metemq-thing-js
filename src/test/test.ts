import { assert } from 'chai';
import { Thing } from '../app/Thing';
import * as mosca from 'mosca';

let broker_port = 5555;
let broker = new mosca.Server({ port: broker_port });


describe('class Thing', function() {
  let thing;
  let temperBind;
  let data;
  let sub;

  this.timeout(5000);

  describe('#Constructor', function() {
    it('should initialize Thing correctly', function(done) {
      thing = new Thing('test_thing-js_edison', {
        username: 'user01',
        password: 'secret',
        url: 'mqtt://localhost:5555'
      });

      done();
    });
  });

  describe('#bind', function() {
    it('should bind a field', function(done) {
      temperBind = thing.bind('temperature');

      data = 'data_from_sensor';
      temperBind.set(data);

      done();
    });
  });


  describe('#call', function() {
    it('should remote-procedure-call a function', function(done) {
      thing.call('serversFunction');
      done();
    });
  });


  describe('#actions', function() {
    it('should do action', function(done) {
      thing.actions({
        toggleLed(c, params) {
          // doSomething(params);
          c.done();
        }
      });

      done();
    });

    it('should represent the progress in percentage', function(done) {
      thing.actions({
        toggleLed(c, params) {
          // doSomething1(params);
          c.progress(50); // 50% done

          // doSomething2(params);
          c.done();
        }
      });

      done();
    });
  });


  describe('#subscribe', function() {

    it('should subscribe a field', function(done) {
      sub = thing.subscribe('temp');
      done();
    });

    it('should handle an event', function(done) {
      sub.onEvent("anEvent", function (payload) {
        // doSomething(payload);
      })

      done();
    });

    it('should handle onAdded, onChanged, and onRemoved event', function(done) {
      sub.onAdded(function (payload) {
        // doSomething(payload);
      })

      sub.onChanged(function (payload) {
        // doSomething(payload);
      })

      sub.onRemoved(function (payload) {
        // doSomething(payload);
      })

      done();
    });

    it('should handle any event', function(done) {
      sub.onAny(function (payload) {
        // doSomething(payload);
      })

      done();
    });

    it('should unsubscribe by Subscription', function(done) {
      sub.unsubscribe(function() {
        // successfully unsubscribed.
        done();
      });
    });
  });

});

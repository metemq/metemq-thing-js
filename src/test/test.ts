import { assert } from 'chai';
import { Thing } from '../app/Thing';

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});


describe('class Thing', function() {
  let thing;
  let temperBind;
  let data;
  let sub;


  describe('#Constructor', function() {
    it('should initialize Thing correctly', function(done) {
      thing = new Thing('test_thing-js_edison', {
        username: 'user01',
        password: 'secret',
        url: 'mqtt://metemq.com'
      });

      done();
    });
  });

  describe('#bind', function() {
    it('should bind a field', function(done) {
      temperBind = thing.bind('temperature');

      done();
    });

    it('', function(done) {
      var data = 'data_from_sensor';
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
      sub = thing.subscribe('pub_name', function() {
        // successfully subscribed.
      });

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
/*
    it('should handle three events at once', function(done) {
      sub.on({
        added (payload) {
          // doOnAdded (payload);
        },
        changed (payload) {
          // doOnChanged(payload);
        },
        removed (payload) {
          // doOnRemoved(payload);
        }
      })

      done();
    });
*/
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

    it('should unsubscribe by Thing', function(done) {
      thing.unsubscribe('pub_name', function() {
        // successfully unsubscribed.
        done();
      });
    });
  });

});

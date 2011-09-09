var tap = require('tap'),
    test = tap.test,
    plan = tap.plan,
    publisher;

test('load publisher', function (t) {
  publisher = require('../src/publisher');
  t.ok(publisher, 'object loaded');
  t.end();
});

test('singleton publisher', function (t) {
  t.ok(publisher.publish);
  t.ok(publisher.subscribe);
  t.end();
});

test('create generic publisher', function (t) {
  var p = publisher();
  t.ok(p.publish);
  t.ok(p.subscribe);
  t.end();
});

test('create publisher from existing object', function (t) {
  var o = {};
  publisher(o);
  t.ok(o.publish);
  t.ok(o.subscribe);
  t.end();
});

test('basics', function (t) {
  t.plan(3);

  publisher.subscribe('test', function (a, b) {
    t.ok(true, 'called subscriptions');
    t.equal(a, 1, 'passed argument');
    t.equal(b, 2, 'passed multiple arguments');
    t.end();
  });

  publisher.publish('test', 1, 2);
});

test('multiple subscriptions on same channel', function (t) {
  t.plan(2);

  publisher.subscribe('test', function () {
    t.ok(true, 'called first subscription');
  });

  publisher.subscribe('test', function () {
    t.ok(true, 'called second subscription');
    t.end();
  });

  publisher.publish('test');
});


test('multiple subscriptions on different channels', function (t) {
  t.plan(2);

  publisher.subscribe('foo', function () {
    t.ok(true, 'called first subscription');
  });

  publisher.subscribe('bar', function () {
    t.ok(true, 'called second subscription');
    t.end();
  });

  publisher.publish('foo');
  publisher.publish('bar');
});

test('handler context', function (t) {
  var o = {}, other = {};

  t.plan(2);
  publisher(o);

  o.subscribe('test', function () {
    t.equal(o, this, 'subscriptions context is the publisher');
  });

  o.subscribe('test', function () {
    t.equal(other, this, 'subscriptions context is the another object');
    t.end();
  }, other);

  o.publish('test');
});

test('subscription', function (t) {
  t.plan(2);

  var p = publisher();

  var subscription = p.subscribe('test', function (msg) {
    t.ok(true, msg);
  });

  p.publish('test', 'call subscription');
  subscription.detach();
  p.publish('test', 'detach subscription');
  subscription.attach();
  p.publish('test', 'attach subscription');

  t.end();
});

test('advise', function (t){
  t.plan(14);

  var adviseMath = publisher.advise(Math)
    .before('pow', 'math:before:pow')
    .before({max:  'math:before:max'})
    .after('pow',  'math:after:pow')
    .after({min:   'math:after:min'});

  publisher.subscribe('math:before:pow', function (obj, a, b) {
    t.ok(true, 'called math:before:pow');
    t.equal(a, 2, 'arguments passed to before advice');
    t.equal(b, 3, 'arguments passed to before advice');
    t.equal(obj, Math, 'set last argument to the advised object');
  });

  publisher.subscribe('math:before:max', function () {
    t.ok(true, 'called math:before:max');
  });

  publisher.subscribe('math:after:pow', function (obj, returns, a, b) {
    t.ok(true, 'called individually subscribed channel');
    t.equal(returns, 8, 'return value passed in as argument');
    t.equal(a, 2, 'arguments passed to after advice');
    t.equal(b, 3, 'arguments passed to after advice');
    t.equal(obj, Math, 'set last argument to the advised object');
  });

  publisher.subscribe('math:after:min', function () {
    t.ok(true, 'called multiple-subscribed channel');
  });

  var pow = Math.pow(2,3);
  t.equal(pow, 8);

  var max = Math.max(1,2,3);
  t.equal(max, 3);

  var min = Math.min(1,2,3);
  t.equal(min, 1);

  t.end();
});

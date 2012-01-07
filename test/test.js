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

test('alternate subscribe signatures', function (t) {
  t.plan(5);

  // Subscribe an object with a method matching the channel name
  var obj = {};
  obj['☃'] = function () { t.ok(true, 'snowman method called'); };
  obj['☼'] = function () { t.ok(true, 'sun method called '); };
  obj['☾'] = function () { t.ok(true, 'moon method called '); };

  // hitch
  publisher.subscribe(obj, '☃');

  // hitch multiple
  publisher.subscribe(obj, ['☼', '☾']);

  // Subscribe multiple handlers at once
  publisher.subscribe({
    '☹': function (){ t.ok(true, 'sad handler called'); },
    '☺': function () { t.ok(true, 'happy handler called'); }
  });

  publisher.publish('☃');
  publisher.publish('☹');
  publisher.publish('☺');
  publisher.publish('☼');
  publisher.publish('☾');

  t.end();
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


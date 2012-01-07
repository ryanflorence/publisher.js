// This is a guide to the `publisher` module.

// * Author: [Ryan Florence](http://ryanflorence.com)
// * License: MIT Style
// * Source: [github](https://github.com/rpflorence/publisher.js)
// * Issues: [github issues](https://github.com/rpflorence/publisher.js/issues)

// Please use github issues to report any bugs.  Pull requests welcome!

// ## Installation - Universal JavaScript support
//
// `publisher` works as an AMD (RequireJS) module, a Node.js module, or a plain
// object on the global object.

// ### AMD (RequireJS) installation

// Place `publisher.js` in your application and require it as usual.
require(['path/to/publisher'], function (publisher) {
  /* Do stuff with publisher here */
});

// ### Node.js Installation
//
// Install with npm
//
//     npm install publisher

// Include like everything else
var publisher = require('publisher');

// ### Other browser usage

// If neither AMD nor Node.js are detected, publisher is global with a
// `noConflict` that restores the previous `publisher` definition and returns
// the publisher object.
publisher;
var myPublisher = publisher.noConflict();

// All of the usage is identical among environments.

// ## Basic Example

// ### Subscribing to a topic

// First you "subscribe" to a topic, and provide a handler to call when the
// topic is published.
publisher.subscribe('onAwesome', function () {
  console.log('awesome');
});

// ### Publishing a topic

// When interesting things happen in your application, you publish the
// topic of interest.  Any attached subscription handlers will be called.  In
// this case, the console will log "awesome".
publisher.publish('onAwesome');

// ### Publish with arguments

// You can also send along some arguments that your
// subscriptions may be interested in when you publish.
publisher.subscribe('onAwesome', function (one, two, foo){
  console.log(one, two, foo);
});

publisher.publish('onAwesome', 1, 2, 'foo');

// ## Widget example

// The topic name is simply a string, which is often namespaced to objects in
// the applicaton and then the method or action they are taking.
var datepicker = {
  open: function (){
    /* some real code */
    publisher.publish('datepicker/open');
  },

  select: function (){
    var oldValue = this.input.value,
        newValue = this.getSelected();
    /* some real code */
    publisher.publish('datepicker/select', newValue, oldValue);
  },

  close: function (){
    /* some real code */
    publisher.publish('datepicker/close');
  }
};

// Subscribe to all the topics
publisher.subscribe('datepicker/open', function () {
  blurOtherStuff();
});
publisher.subscribe('datepicker/select', doSomeThingOnDateSelect);
publisher.subscribe('datepicker/close', theForm.submit.bind(theForm));

// ## Creating Individual Publishers

// While `publisher` is itself a global publisher, it's also a function allowing
// you to turn any object into it's own closed pub/sub system. Publisher extends
// the object with publish and subscribe methods.
var datepicker = publisher({
  open: function (){
    // `publish` is now a method of the object, call it with `this.publish`.
    this.publish('open');
  },

  select: function (){
    this.publish('select', newValue, oldValue);
  },

  close: function (){
    this.publish('close');
  }
});

// `subscribe` is also now a method of the object.
datepicker.subscribe('open', doSomethingOnOpen);

// This pattern makes extending the behavior of an object trivial.

// You can also create a generic publisher by calling publisher with no
// arguments at all.
var localPub = publisher();
localPub.subscribe('topic', function() {});
localPub.publish('topic');

// ## Binding the context of handlers to other objects

// Subscription handlers are naturally bound to the publisher. We can verify this
// behavior in our previous examples.
publisher.subscribe('onAwesome', function () {
  console.log(this === publisher); //> true
});

datepicker.subscribe('open', function () {
  console.log(this === datepicker); //> true
});

// Sometimes you may want to change the context of the method, `subscribe` takes
// a third argument to set the context of the subscription
var context = {};
publisher.subscribe('onAwesome', function () {
  console.log(this === context); //> true
}, context);

// It's useful when calling the method of another object
publisher.subscribe('onAwesome', datepicker.open, datepicker);

// But that's ugly, so publisher has some alternate signatures.

// ## Alternate subscription signatures

// ### The "hitch" subscription signature

// If you name object methods after a topic, you can simply "hitch" the
// object. Publisher will create a subscription on the topic matching the
// object's method name, and sets the object as the context of the
// handler.
datepicker.onAwesome = function(){
  this.open(); // this is datepicker
};
publisher.subscribe(datepicker, 'onAwesome');

// which is functionally equivalent to, but much better looking than:
publisher.subscribe('onAwesome', datepicker.onAwesome, datepicker);

// This is really useful for publishing application events like domready:
// All objects that care about the event can have a method named
// `domready` and then respond to the topic when it's published.

// Assuming we're using jQuery...
datepicker.domready = function () {
  this.element = $('#some_element');
}
publisher.subscribe(datepicker, 'domready');

// elsewhere in the app
$(function () {
  publisher.publish('domready');
});

// ### The "hitch multiple" subscribe signature

// Often your subscriber will be interested in multiple topics, doing
// this gets annoying:
publisher.subscribe(datepicker, 'domready');
publisher.subscribe(datepicker, 'calendar:on');
publisher.subscribe(datepicker, 'calendar:off');

// Instead, publisher supports an array for the second argument, so when
// your object has multiple methods with names matching topics you want
// to subscribe to, you can do it in one statement.
publisher.subscribe(datepicker, [
  'domready',
  'calendar:on',
  'calendar:off'
]);

// ### subscribing multiple handlers

// You can also subscribe to multiple topics at once, so instead of
// doing them all individually:
publisher.subscribe('foo', function(){});
publisher.subscribe('bar', function(){});

// You can do them all at once
publisher.subscribe({
  'foo': function(){},
  'bar': function(){}
});

// ## Subscription Objects
//
// The `subscribe` method returns a subscription object allowing you to manage
// the subscription with two methods:
//
// 1. `attach` and
// 2. `detach`

// Store the subscription in a variable
var subscription = publisher.subscribe('foo', function () {
  console.log('hello');
});

// console logs 'foo'
publisher.publish('foo');

// Detach the subscription and console logs nothing
subscription.detach();
publisher.publish('foo');

// Attach the subscription and things are back to normal
subscription.attach();
publisher.publish('foo');

// The methods return the subscription object so you can detach upon creation
var subscription2 = publisher.subscribe('foo', function () {
  console.log('foo 2');
}).detach();

// Signatures that create several subscriptions at once return a
// collection of handlers of the same type.
var subscriptions = publisher.subscribe({
  foo: function() {},
  bar: function() {}
});

subscriptions.foo.detach();
subscriptions.bar.attach();

var hitchSubscriptions = publisher.subscribe(datepicker, [
  'domready',
  'calendar:on',
  'calendar:off'
]);

hitchSubscriptions[0].detach();
hitchSubscriptions[1].detach(); // etc.

// ## Advising Objects
//
// Deprecated.
//
// If you are one of the few crazy folks who used this (like me),
// please use advise.js to get this back. I'll be writing a shim soon to
// show here.


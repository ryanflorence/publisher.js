// * Author: [Ryan Florence](http://ryanflorence.com)
// * License: MIT Style
// * Source: [github](https://github.com/rpflorence/publisher.js)
// * Issues: [github issues](https://github.com/rpflorence/publisher.js/issues)

// Please use github issues to report any bugs.  Pull requests welcome!

// [View this live on jsFiddle](http://jsfiddle.net/rpflorence/6QScG/)

// ## About Pub/Sub in JavaScript
//
// When moving from bang-it-out domready code to modular development most of
// us start to create an unhealthy mess of object dependencies and coupling.
// Ideally, you don't want your objects to know about each other.  They need to
// exist atomically, for testability, maintainability, and portability.  Enter
// Pub/Sub and Aspect Oriented Programming.

// ## Installation - Universal JavaScript support

// `publisher` works as an AMD (RequireJS) module, a Node.js module, or a plain
// object. If neither AMD nor Node.js environments are detected, the publisher
// object is assigned to the global object (window).

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
publisher
publisher.noConflict();

// All of the usage is identical among environments.

// ## Basic Example

// ### Subscribing to a channel

// First you "subscribe" to a channel, and provide a handler to call when the
// channel is published.
publisher.subscribe('onAwesome', function () {
  console.log('awesome');
});

// ### Publishing a channel

// When interesting things happen in your application, you publish the
// channel of interest.  Any attached subscription handlers will be called.  In
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

// The channel name is simply a string, which is often namespaced to objects in
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

// Subscribe to all the channels
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

// ## It's a lot like DOM events ...

// Here we make the window a publisher and publish the 'load' channel in its
// `onload` property method.  Making it behave like `addEventListener`, except
// we also pass along the load time.
publisher(window);

window.onload = (function (){
  var start = +new Date;
  return function (){
    var loadTime = +new Date - start;
    this.publish('load', loadTime);
  }
}());

window.subscribe('load', function (loadTime){
  console.log('loaded in ', loadTime, 'ms');
});

// ## Binding the context of handlers to other objects

// Subscription handlers are naturally bound to the object.  We can verify this
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

// It's most useful when calling the method of another object
publisher.subscribe('onAwesome', datepicker.open, datepicker);

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

// ## Advising Objects, 100% Decoupled Applications
//
// Most pub/sub systems require your objects to know about the publisher.  As
// with all of the previous examples, we had to reference the publisher object
// within our modules.  The goal of pub/sub is to decouple our objects--and
// requiring every module to know about `publisher` is still the same problem.
//
// With `publisher.advise` you can write truly atomic modules--only publisher
// has to know about the objects, and not the other way around.  This allows you
// to write modules that only concern themselves with themselves: they don't
// know about other modules, and they don't know about `publisher`.


// ### Advising Math

// While doing this to a built-in isn't really advised, it makes for a great
// example. First we create an advisor object.
var adviseMath = publisher.advise(Math);

// Advisor objects have two methods, `before`, and `after` that tell
// `publisher` to publish to a channel before or after a method is called.

// ### advise before

// Before `Math.pow` is called, publisher will publish to `'math:before:pow'`.
adviseMath.before('pow', 'math:before:pow');

// The subscription handler gets the object being advised (`Math`) as the first
// argument and then the arguments sent to `Math.pow`.
publisher.subscribe('math:before:pow', function logPowStuff(math, x, y) {
  console.log(x, y);
  console.log(math === Math);
});

// The logPowStuff function gets called.  The console logs `2`, `3`, and `true`.
Math.pow(2,3);

// ### advise after

// After `Math.sqrt` is called, publisher will publish to `'√'`.  The name of
// the channel being published doesn't matter, this one seems appropriate.
adviseMath.after('min', '√');

// The subscription handler gets the object being advised (`Math`) as the first
// argument, the return value of the operation, and then the arguments sent to
// `Math.sqrt`.
publisher.subscribe('√', function logReturns(math, returns, x) {
  console.log(returns);
});

// logReturns gets called and the console logs 5.
Math.sqrt(25);

// You can advise multiple methods at a time by sending an object of key:value
// pairs.  You can also chain the advisor object.
publisher.advise(Math).before({
  pow: 'math:before:pow',
  max: 'math:before:max'
}).after({
  min: 'math:after:min',
  sqrt: '√'
});

// This is an incredibly powerful pattern for connecting the modules in your
// application.

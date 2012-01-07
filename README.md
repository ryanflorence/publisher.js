publisher.js
================================================================================

**feature-rich publish / subscribe system.**

Guide
-----

[Read the guide][guide] to learn how to use publisher.

Installation and Universal JavaScript Support
--------------------------------------------------------------------------------

`publisher` works as an AMD module, a Node.js module, or a plain object.

### AMD (RequireJS) installation

Place `publisher.js` in your application and require it as usual, it
registers anonymously.

```javascript
require(['path/to/publisher'], function (publisher) {
  /* Do stuff with publisher here */
});
```

### Node.js Installation

Install with npm

    npm install publisher

Include like everything else

```javascript
var publisher = require('publisher');
```

### Other browser usage

If neither AMD nor Node.js are detected, publisher is global with a
`noConflict` that restores the previous `publisher` definition and returns
the publisher object.

```javascript
publisher
publisher.noConflict();
```

License & Copyright
--------------------------------------------------------------------------------

Copyright (c) Ryan Florence

MIT-Style License

Contributing
--------------------------------------------------------------------------------

Fork, create a topic branch, send a pull request :D

### Development dependencies

While `publisher` has no dependencies, developing it does.

You'll need to install some stuff to run the tests and generate docs.  There's
a script in `bin` to help.  First make sure you've got Node.js, npm, and
Python installed, then simply run from the repository root:

    $ ./bin/setup-dev

### Running tests

    $ ./bin/run-tests
    # or
    $ tap test/test.js

### Generating docs

    $ ./bin/generate-docs

[guide]:http://ryanflorence.com/publisher.js/

tart-host
=========

Actor-based core scheduling for child configurations

## Usage

To run the below example run:

    npm run readme

```javascript
"use strict";

var host = require('../index.js');
var core = require('tart');
var tart = require('tart-stepping');

var coreSponsor = core.minimal();

var configA = tart.stepping();
var configB = tart.stepping();
var configC = tart.stepping();

var eventLoopA = coreSponsor(host.adapter(configA, configA.eventLoop));
var eventLoopB = coreSponsor(host.adapter(configB, configB.eventLoop));
var eventLoopC = coreSponsor(host.adapter(configC, configC.eventLoop));

var scheduler = coreSponsor(host.eventLoopRing([
    { eventLoop:eventLoopA, options:{ count:1 } }, 
    { eventLoop:eventLoopB }, 
    { eventLoop:eventLoopC, options:{ count:2 } }
]));

/*
Create an actor behavior that counts down to zero,
printing labelled messages to the console log.
*/
var countdown = function countdown(label) {
    return function countdownBeh(count) {
        console.log(label, count);
        if (--count > 0) {
            this.self(count);
        }
    };
};

var countdownA = configA.sponsor(countdown('.O.|.|.'));
var countdownB = configB.sponsor(countdown('.|.O.|.'));
var countdownC = configC.sponsor(countdown('.|.|.O.'));

countdownA(2);
countdownB(3);
countdownC(5);

scheduler();  // start scheduler

```

## Tests

    npm test

## Documentation

**Public API**

  * [host.adapter(object, method)](#hostadapterobjectmethod)
  * [host.dispatchRing(children\[, errorLog\])](#hostdispatchRingchildrenerrorLog)
  * [host.eventLoopRing(children\[, errorLog\])](#hosteventLoopRingchildrenerrorLog)

### host.adapter(object, method)

Create an actor behavior that calls a synchronous object method
using `message.arguments` as the argument list
and sending the return value to `message.ok`.
If an exception is thrown, it is sent to `message.fail`.

### host.dispatchRing(children\[, errorLog\])

Create an actor behavior that cycles through a list of child configurations,
dispatching one event at a time until no events remain.

### host.dispatchRing(children\[, errorLog\])

Create an actor behavior that cycles through a list of child configurations,
calling `eventLoop(options)` for each until all event queues are exhausted.

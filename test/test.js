/*

test.js - unit tests

The MIT License (MIT)

Copyright (c) 2013 Dale Schumacher, Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";

var host = require('../index.js');
var tart = require('tart-stepping');

var test = module.exports = {};

test['stepping event loop runs to completion'] = function (test) {
    test.expect(2);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;
    
    test.equal(sponsor, stepping.sponsor);

    test.ok(stepping.eventLoop());
    test.done();
};

test['dispatchRing delivers in round-robin order'] = function (test) {
    test.expect(11);
    var coreConfig = tart.stepping();
    var coreSponsor = coreConfig.sponsor;

    var configA = tart.stepping();
    var configB = tart.stepping();
    var configC = tart.stepping();

    var dispatchA = coreSponsor(host.adapter(configA, configA.dispatch));
    var dispatchB = coreSponsor(host.adapter(configB, configB.dispatch));
    var dispatchC = coreSponsor(host.adapter(configC, configC.dispatch));

    var scheduler = coreSponsor(host.dispatchRing([
        dispatchA, 
        dispatchC, 
        dispatchB, 
        dispatchC 
    ]));

    var expectNext = 0;
    var expect1Beh = function expect1Beh(message) {
        test.strictEqual(1, message);
        test.strictEqual(message, ++expectNext);
        this.self(5);
        this.behavior = expect5Beh;
    };
    var expect2Beh = function expect2Beh(message) {
        test.strictEqual(2, message);
        test.strictEqual(message, ++expectNext);
        this.self(4);
        this.behavior = expect4Beh;
    };
    var expect3Beh = function expect3Beh(message) {
        test.strictEqual(3, message);
        test.strictEqual(message, ++expectNext);
        this.behavior = expectNothingBeh;
    };
    var expect4Beh = function expect4Beh(message) {
        test.strictEqual(4, message);
        test.strictEqual(message, ++expectNext);
        this.behavior = expectNothingBeh;
    };
    var expect5Beh = function expect5Beh(message) {
        test.strictEqual(5, message);
        test.strictEqual(message, ++expectNext);
        this.behavior = expectNothingBeh;
    };
    var expectNothingBeh = function expectNothingBeh(message) {
        throw new Error('Unexpected: ' + message);
    };

    var actorA = configA.sponsor(expect1Beh);
    var actorB = configB.sponsor(expect3Beh);
    var actorC = configC.sponsor(expect2Beh);

    actorA(1);  // [1, 5]
    actorB(3);  // [3]
    actorC(2);  // [2, 4]

    scheduler();  // start scheduler
    
    test.ok(coreConfig.eventLoop());
    test.done();
};

test['eventLoopRing delivers according to options'] = function (test) {
    test.expect(15);
    var coreConfig = tart.stepping();
    var coreSponsor = coreConfig.sponsor;

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

    var expectNext = 0;
    var expect1Beh = function expect1Beh(message) {
        test.strictEqual(1, message);
        test.strictEqual(message, ++expectNext);
        this.self(6);
        this.behavior = expect6Beh;
    };
    var expect2Beh = function expect2Beh(message) {
        test.strictEqual(2, message);
        test.strictEqual(message, ++expectNext);
        this.self(3);
        this.behavior = expect3Beh;
    };
    var expect3Beh = function expect3Beh(message) {
        test.strictEqual(3, message);
        test.strictEqual(message, ++expectNext);
        this.behavior = expectNothingBeh;
    };
    var expect4Beh = function expect4Beh(message) {
        test.strictEqual(4, message);
        test.strictEqual(message, ++expectNext);
        this.self(5);
        this.behavior = expect5Beh;
    };
    var expect5Beh = function expect5Beh(message) {
        test.strictEqual(5, message);
        test.strictEqual(message, ++expectNext);
        this.self(7);
        this.behavior = expect7Beh;
    };
    var expect6Beh = function expect6Beh(message) {
        test.strictEqual(6, message);
        test.strictEqual(message, ++expectNext);
        this.behavior = expectNothingBeh;
    };
    var expect7Beh = function expect7Beh(message) {
        test.strictEqual(7, message);
        test.strictEqual(message, ++expectNext);
        this.behavior = expectNothingBeh;
    };
    var expectNothingBeh = function expectNothingBeh(message) {
        throw new Error('Unexpected: ' + message);
    };

    var actorA = configA.sponsor(expect1Beh);
    var actorB = configB.sponsor(expect2Beh);
    var actorC = configC.sponsor(expect4Beh);

    actorA(1);  // [1, 6]
    actorB(2);  // [2, 3]
    actorC(4);  // [4, 5, 7]

    scheduler();  // start scheduler
    
    test.ok(coreConfig.eventLoop());
    test.done();
};

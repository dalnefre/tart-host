/*

readme.js - readme example script

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

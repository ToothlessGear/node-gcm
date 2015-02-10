"use strict";

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    senderPath = './sender',
    Constants = require('./constants');

var test = function() {
  var args = {};
  var requestStub = function (options, callback) {
    args.options = options;
    console.log("Calling stub");
    return callback( args.err, args.res, args.resBody );
  };
  var Sender = proxyquire(senderPath, { 'request': requestStub });

  var options = {
      proxy: 'http://myproxy.com',
      maxSockets: 100,
      timeout: 1000
    };

  var sender = new Sender("test", options);
  sender.send({ data: {} }, [], 0, function (err) { console.log("Error: " + err); });

  console.log(args);

  return "Hello";
}

test();

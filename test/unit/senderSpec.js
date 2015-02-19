"use strict";

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    Sender = require('../../lib/sender'),
    Constants = require('../../lib/constants');

describe('UNIT Sender', function () {
  // Use object to set arguments passed into callback
  var args = {};

  describe('constructor', function () {
    it('should call new on constructor if user does not', function () {
      var sender = Sender();
      expect(sender).to.not.be.undefined;
      expect(sender).to.be.instanceOf(Sender);
    });

    it('should create a Sender with key and options passed in', function () {
      var options = {
        proxy: 'http://myproxy.com',
        maxSockets: 100,
        timeout: 100
      };
      var key = 'myAPIKey', 
          sender = new Sender(key, options);
      expect(sender).to.be.instanceOf(Sender);
      expect(sender.key).to.equal(key);
      expect(sender.options).to.deep.equal(options);
    });

    it.skip('should do something if not passed a valid key');
  });

  describe('sendNoRetry()', function () {
    var restore = {};
    // Set arguments passed in request proxy
    function setArgs(err, res, resBody) {
      args = {
        err: err,
        res: res,
        resBody: resBody
      };
    };

    before( function () {
      restore.sendBaseNoRetry = Sender.prototype.sendBaseNoRetry;
      Sender.prototype.sendBaseNoRetry = function (message, recipient, callback) {
        console.log('Firing send');
        args.message = message;
        args.recipient = recipient;
        callback( args.err, args.result );
      };
    });

    after( function () {
      Sender.prototype.sendBaseNoRetry = restore.sendBaseNoRetry;
    });

    it('should pass a message, recipient with regIDs, and callback to sendBaseNoRetry', function() {
      var callback = sinon.spy(),
          recipient = { registrationIds: [1, 2, 3] },
          message = "hello",
          sender = new Sender('myKey');

      sender.sendNoRetry(message, [1, 2, 3], callback);
      expect(callback.calledOnce).to.be.true;
      expect(args.message).to.equal.message;
      expect(args.recipient).to.equal.recipient;
    });
    
  });

  describe('send()', function () {
    var restore = {};
    // Set args passed into sendNoRetry
    function setArgs(err, result) {
      args = {
        err: err,
        result: result,
        tries: 0
      };
    };

    before( function () {
      restore.sendBase = Sender.prototype.sendBase;
      Sender.prototype.sendBase = function (message, recipient, retryCount, callback) {
        console.log('Firing send');
        args.message = message;
        args.recipient = recipient;
        args.retryCount = retryCount;
        callback( args.err, args.result );
      };
    });

    after( function () {
      Sender.prototype.sendBase = restore.sendBase;
    });

    it('should pass a message, recipient with regDs, retry count, and callback to sendBase', function() {
      var callback = sinon.spy(),
          recipient = { registrationIds: [1, 2, 3] },
          message = "hello",
          sender = new Sender('myKey');

      sender.sendBase(message, [1, 2, 3], 1, callback);
      expect(callback.calledOnce).to.be.true;
      expect(args.message).to.equal.message;
      expect(args.recipient).to.equal.recipient;
      expect(args.retryCount).to.equal(1);
    });
  });

});




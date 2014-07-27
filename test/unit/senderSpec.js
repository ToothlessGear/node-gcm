"use strict";

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    senderPath = '../../lib/sender',
    Constants = require('../../lib/constants');

describe('UNIT Sender', function () {
  // Use object to set arguments passed into callback
  var args = {};
  var requestStub = function (options, callback) {
    args.options = options;
    return callback( args.err, args.res, args.resBody );
  };
  var Sender = proxyquire(senderPath, { 'request': requestStub });

  function setArgs(err, res, resBody) {
    args.err = err;
    args.res = res;
    args.resBody = resBody;
  };

  describe('constructor', function () {
    var Sender = require(senderPath);

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
      var key = 'myAPIKey';
      var sender = new Sender(key, options);
      expect(sender).to.be.instanceOf(Sender);
      expect(sender.key).to.equal(key);
      expect(sender.options).to.deep.equal(options);
    });

    it.skip('should do something if not passed a valid key');
  });

  describe('sendNoRetry()', function () {
    it('should set proxy, maxSockets, and/or timeout of req object if passed into constructor', function () {
      var options = {
        proxy: 'http://myproxy.com',
        maxSockets: 100,
        timeout: 1000
      };
      var sender = new Sender('mykey', options);
      sender.sendNoRetry({ data: {} }, '', function () {});
      expect(args.options.proxy).to.equal(options.proxy);
      expect(args.options.maxSockets).to.equal(options.maxSockets);
      expect(args.options.timeout).to.equal(options.timeout);
    });

    it('should set the API key of req object if passed in API key', function () {
      var sender = new Sender('myKey');
      sender.sendNoRetry({ data: {} }, '', function () {});
      expect(args.options.headers.Authorization).to.equal('key=myKey');
    });

    it('should stringify body of req before it is sent', function () {
      var sender = new Sender('mykey');
      sender.sendNoRetry({ collapseKey: 'Message', data: {} }, '', function () {});
      expect(args.options.body).to.be.a('string');
    });

    it('should set properties of body with message properties', function () {
      var mess = {
        delayWhileIdle: true,
        collapseKey: 'Message',
        timeToLive: 100,
        dryRun: true,
        data: {
          name: 'Matt'
        }
      };
      var sender = new Sender('mykey');
      sender.sendNoRetry(mess, '', function () {});
      var body = JSON.parse(args.options.body);
      expect(body[Constants.PARAM_DELAY_WHILE_IDLE]).to.equal(mess.delayWhileIdle);
      expect(body[Constants.PARAM_COLLAPSE_KEY]).to.equal(mess.collapseKey);
      expect(body[Constants.PARAM_TIME_TO_LIVE]).to.equal(mess.timeToLive);
      expect(body[Constants.PARAM_DRY_RUN]).to.equal(mess.dryRun);
      expect(body[Constants.PARAM_PAYLOAD_KEY]).to.deep.equal(mess.data);
    });

    it('should set the registration ids to reg ids passed in', function () {
      var sender = new Sender('myKey');
      sender.sendNoRetry({ data: {} }, 12, function () {});
      var body = JSON.parse(args.options.body);
      expect(body[Constants.JSON_REGISTRATION_IDS]).to.equal(12);
    });

    it('should pass an error into callback if request returns an error', function () {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      setArgs('an error', {}, {});
      sender.sendNoRetry({ data: {} }, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.calledWith('an error')).to.be.ok;
    });

    it('should pass an error into callback if response does not exist', function () {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      setArgs(null, undefined, {});
      sender.sendNoRetry({ data: {} }, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.be.a('string');
    });

    it('should return the status code as an error if returned a 500', function () {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      setArgs(null, { statusCode: 500 }, {});
      sender.sendNoRetry({ data: {} }, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal(500);
    });

    it('should return the status code as an error if returned a 401', function () {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      setArgs(null, { statusCode: 401 }, {});
      sender.sendNoRetry({ data: {} }, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal(401);
    });

    it('should return the status code as an error if returned a 400', function () {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      setArgs(null, { statusCode: 400 }, {});
      sender.sendNoRetry({ data: {} }, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal(400);
    });

    it('should pass an error into the callback if resBody cannot be parsed', function () {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      setArgs(null, { statusCode: 200 }, { parse: false });
      sender.sendNoRetry({ data: {} }, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.be.a('string');
    });

    it('should pass in parsed resBody into callback on success', function () {
      var callback = sinon.spy();
      var resBody = {
        message: 'woohoo!',
        success: true
      };
      var sender = new Sender('myKey');
      setArgs(null, { statusCode: 200 }, JSON.stringify(resBody));
      sender.sendNoRetry({ data: {} }, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][1]).to.deep.equal(resBody);
    });
  });

  describe.skip('send()', function () {

  });
});
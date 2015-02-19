"use strict";

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    senderBasePath = '../../lib/sender_base',
    Constants = require('../../lib/constants');

describe('UNIT SenderBase', function () {
  // Use object to set arguments passed into callback
  var args = {};
  var requestStub = function (options, callback) {
    args.options = options;
    return callback( args.err, args.res, args.resBody );
  };
  var SenderBase = proxyquire(senderBasePath, { 'request': requestStub });

  describe('constructor', function () {
    it('should call new constructor if user does not', function() {
      var senderBase = SenderBase();
      expect(senderBase).to.not.be.undefined;
      expect(senderBase).to.be.instanceOf(SenderBase);
    });

    it('should create a SenderBase with key and options passed in', function() {
      var options = {
        proxy: 'http://myproxy.com',
        maxSockets: 100,
        timeout: 100
      };

      var key = 'myApiKey',
          senderBase = new SenderBase(key, options);
      expect(senderBase).to.be.instanceOf(SenderBase);
      expect(senderBase.key).to.equal(key);
      expect(senderBase.options).to.deep.equal(options);
    });

    it('should create a SenderBase with a valid request object', function() {
      var senderBase = new SenderBase();
      expect(senderBase.req).to.not.be.undefined;
      expect(senderBase.req).to.be.a('Function');
    });
  });

  describe('sendBaseNoRetry', function() {

    // Set arguments passed in request proxy
    function setArgs(err, res, resBody) {
      args = {
        err: err,
        res: res,
        resBody: resBody
      };
    };

    var testRecipient = {registrationIds: ['myRegId']};

    it('should throw an error if no valid recipient is provided', function() {
      var senderBase = new SenderBase(),
          callback = sinon.spy(),
          errorMsg = 'No recipients provided';

      senderBase.sendBaseNoRetry({data: {}}, null, callback);
      expect(callback.args[0][0]).to.equal(errorMsg);
      senderBase.sendBaseNoRetry({data: {}}, 'misplaced string', callback);
      expect(callback.args[0][0]).to.equal(errorMsg);
      senderBase.sendBaseNoRetry({data: {}}, {}, callback);
      expect(callback.args[0][0]).to.equal(errorMsg);
    });

    it('should set proxy, maxSockets, and/or timeout of req object if passed into constructor', function() {
      var options = {
        proxy: 'http://myproxy.com',
        maxSockets: 100,
        timeout: 1000
      };
      var senderBase = new SenderBase('mykey', options);
      senderBase.sendBaseNoRetry({ data: {} }, testRecipient, function () {});
      expect(args.options.proxy).to.equal(options.proxy);
      expect(args.options.maxSockets).to.equal(options.maxSockets);
      expect(args.options.timeout).to.equal(options.timeout);
    });

    it('should set the API key of req object if passed in API key', function () {
      var senderBase = new SenderBase('myKey');
      senderBase.sendBaseNoRetry({ data: {} }, testRecipient, function () {});
      expect(args.options.headers.Authorization).to.equal('key=myKey');
    });

    it('should stringify body of req before it is sent', function () {
      var senderBase = new SenderBase('mykey');
      senderBase.sendBaseNoRetry({ collapseKey: 'Message', data: {} }, testRecipient, function() {});
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
      var senderBase = new SenderBase('mykey');
      senderBase.sendBaseNoRetry(mess, testRecipient, function () {});
      var body = JSON.parse(args.options.body);
      expect(body[Constants.PARAM_DELAY_WHILE_IDLE]).to.equal(mess.delayWhileIdle);
      expect(body[Constants.PARAM_COLLAPSE_KEY]).to.equal(mess.collapseKey);
      expect(body[Constants.PARAM_TIME_TO_LIVE]).to.equal(mess.timeToLive);
      expect(body[Constants.PARAM_DRY_RUN]).to.equal(mess.dryRun);
      expect(body[Constants.PARAM_PAYLOAD_KEY]).to.deep.equal(mess.data);
    });

    it('should set registration ID body parameter if the recipient contains the registrationIds attribute', function() {
      var senderBase = new SenderBase('mykey');
      senderBase.sendBaseNoRetry({data: {}}, testRecipient, function() {});
      var body = JSON.parse(args.options.body);
      expect(body[Constants.JSON_REGISTRATION_IDS]).to.not.be.undefined;
      expect(body[Constants.JSON_REGISTRATION_IDS]).to.deep.equal(['myRegId']);
    });

    it('should set the "to" body parameter if the recipient contains the notificationKey attribute', function() {
      var senderBase = new SenderBase('mykey');
      senderBase.sendBaseNoRetry({data: {}}, {notificationKey: 'notKey'}, function() {});
      var body = JSON.parse(args.options.body);
      expect(body[Constants.PARAM_TO]).to.not.be.undefined;
      expect(body[Constants.PARAM_TO]).to.equal('notKey');
    });

    it.skip('should set the registration ID body parameter if the recipient contains both registration IDs and a notification key');

    it('should pass an error into callback if request returns an error', function () {
      var callback = sinon.spy(),
          senderBase = new SenderBase('myKey');
      setArgs('an error', {}, {});
      senderBase.sendBaseNoRetry({ data: {} }, testRecipient, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.calledWith('an error')).to.be.ok;
    });

    it('should pass an error into callback if response does not exist', function () {
      var callback = sinon.spy(),
          senderBase = new SenderBase('myKey');
      setArgs(null, undefined, {});
      senderBase.sendBaseNoRetry({ data: {} }, testRecipient, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal('response is null');
    });

    it('should return the status code as an error if returned a 500', function () {
      var callback = sinon.spy(),
          senderBase = new SenderBase('myKey');
      setArgs(null, { statusCode: 500 }, {});
      senderBase.sendBaseNoRetry({ data: {} }, testRecipient, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal(500);
    });

    it('should return the status code as an error if returned a 401', function () {
      var callback = sinon.spy(),
          senderBase = new SenderBase('myKey');
      setArgs(null, { statusCode: 401 }, {});
      senderBase.sendBaseNoRetry({ data: {} }, testRecipient, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal(401);
    });

    it('should return the status code as an error if returned a 400', function () {
      var callback = sinon.spy(),
          senderBase = new SenderBase('myKey');
      setArgs(null, { statusCode: 400 }, {});
      senderBase.sendBaseNoRetry({ data: {} }, testRecipient, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal(400);
    });

    it('should pass an error into the callback if resBody cannot be parsed', function () {
      var callback = sinon.spy(),
          senderBase = new SenderBase('myKey');
      setArgs(null, { statusCode: 200 }, "non-JSON string.");
      senderBase.sendBaseNoRetry({ data: {} }, testRecipient, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.be.a('string');
    });

    it('should pass in parsed resBody into callback on success', function () {
      var callback = sinon.spy();
      var resBody = {
        message: 'woohoo!',
        success: true
      };
      var senderBase = new SenderBase('myKey');
      setArgs(null, { statusCode: 200 }, JSON.stringify(resBody));
      senderBase.sendBaseNoRetry({ data: {} }, testRecipient, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][1]).to.deep.equal(resBody);
    });
  });

  describe('sendBase', function() {
    var restore = {},
        backoff = Constants.BACKOFF_INITIAL_DELAY;

    // Set args passed into sendNoRetry
    function setArgs(err, result) {
      args = {
        err: err,
        result: result,
        tries: 0
      };
    };

    before(function () {
      restore.sendBaseNoRetry = SenderBase.prototype.sendBaseNoRetry;
      SenderBase.prototype.sendBaseNoRetry = function (message, recipient, callback) {
        console.log('Firing send');
        args.message = message;
        args.recipient = recipient;
        args.reg_ids = recipient.registrationIds;
        args.tries++;

        callback(args.err, (args.result && args.result.constructor === Array) 
          ? args.result[args.tries - 1] : args.result );
      };
    });

    after( function () {
      SenderBase.prototype.sendBaseNoRetry = restore.sendBaseNoRetry;
    });

    it('should pass an error into callback if no valid recipient is specified', function() {
      var callback = sinon.spy(),
          senderBase = new SenderBase('myKey');

      senderBase.sendBase({data: {}}, null, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal('No recipient data provided!');
      callback.reset();
      senderBase.sendBase({data: {}}, {}, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal('No recipient data provided!');
      callback.reset();
      senderBase.sendBase({data: {}}, {registrationIds: []}, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal('No recipient data provided!');
      callback.reset();
      senderBase.sendBase({data: {}}, {notificationKey: ''}, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal('No recipient data provided!');
    });

    it('should pass the message and recipient to sendBaseNoRetry on call', function() {
      var callback = sinon.spy(),
          senderBase = new SenderBase('myKey'),
          message = "Test",
          recipient = {registrationIds: [1, 2, 3]};
      setArgs(null, {});
      senderBase.sendBase(message, recipient, 0, callback);
      expect(args.message).to.equal(message);
      expect(args.recipient).to.deep.equal(recipient);
      expect(args.tries).to.equal(1);
    });

    it('should pass the result into callback if successful for recipient', function () {
      var callback = sinon.spy(),
          result = { success: true },
          senderBase = new SenderBase('myKey');
      setArgs(null, result);
      senderBase.sendBase({}, {registrationIds: [1, 2, 3]}, 0, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][1]).to.equal(result);
      expect(args.tries).to.equal(1);
    });

    it('should retry number of times passed into call and do exponential backoff', function (done) {
      var start = new Date();
      var callback = function () {
        expect(args.tries).to.equal(2);
        expect(new Date() - start).to.be.gte(Math.pow(2, 0) * backoff);
        done();
      };
      var senderBase = new SenderBase('myKey');
      setArgs('my error');
      senderBase.sendBase({ data: {}}, {registrationIds: [1]}, 1, callback);
    });

    it('should retry all recipient regIds in event of an error', function (done) {
      var start = new Date();
      var callback = function () {
        expect(args.tries).to.equal(2);
        expect(args.reg_ids.length).to.equal(3);
        done();
      };
      var senderBase = new SenderBase('myKey');
      setArgs('my error');
      senderBase.sendBase({ data: {}}, {registrationIds: [1,2,3]}, 1, callback);
    });

    it('should retry with the same notification key in event of an error', function (done) {
      var start = new Date();
      var callback = function () {
        expect(args.tries).to.equal(2);
        expect(args.recipient.notificationKey).to.equal('test');
        done();
      };
      var senderBase = new SenderBase('myKey');
      setArgs('my error');
      senderBase.sendBase({ data: {}}, {notificationKey: 'test'}, 1, callback);
    });

    it('should retry a partially-successful recipient with reg IDs using the unsuccessful reg IDs', function(done) {
      var senderBase = new SenderBase('myKey'),
          firstTryRecipient = {registrationIds: [1, 2, 3]},
          firstTryResult = {
            success: 1, 
            failure: 2, 
            results: [
              {message_id: 1234},
              {error: "Unavailable"},
              {error: "Unavailable"}
            ]
          },
          secondTryRecipient = {registrationIds: [2, 3]},
          secondTryResult = {
            success: 3,
            failure: 0,
            results: [
              {message_id: 1234},
              {message_id: 1234},
              {message_id: 1234}
            ]
          };

        setArgs(null, [firstTryResult, secondTryResult]);

        senderBase.sendBase({data: {}}, firstTryRecipient, function(err, result) {
          expect(args.tries).to.equal(2);
          expect(args.recipient).to.deep.equal(secondTryRecipient);
          expect(result).to.deep.equal(secondTryResult);
          done();
        });
    });

    it('should retry a partially-successful recipient with notification key using the unsuccessful reg IDs', function(done) {
      var senderBase = new SenderBase('myKey'),
          firstTryRecipient = {notificationKey: 'nkey'},
          firstTryResult = {
            success: 1, 
            failure: 2, 
            failed_registration_ids: [2, 3]
          },
          secondTryRecipient = {registrationIds: [2, 3]},
          secondTryResult = {
            success: 3,
            failure: 0,
            results: [
              {message_id: 1234},
              {message_id: 1234}
            ]
          };

        setArgs(null, [firstTryResult, secondTryResult]);

        senderBase.sendBase({data: {}}, firstTryRecipient, function(err, result) {
          expect(args.tries).to.equal(2);
          expect(args.recipient).to.deep.equal(secondTryRecipient);
          expect(result).to.deep.equal(secondTryResult);
          done();
        });
    });

    it('should pass the error into callback if failure and no retry for recipient', function () {
      var callback = sinon.spy(),
          error = 'my error',
          senderBase = new SenderBase('myKey');
      setArgs(error);
      senderBase.sendBase({}, {registrationIds: [1, 2, 3]}, 0, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal(error);
      expect(args.tries).to.equal(1);
    });
  });
});









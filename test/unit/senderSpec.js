"use strict";

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    senderPath = '../../lib/sender',
    Constants = require('../../lib/constants'),
    Message = require('../../lib/message');

describe('UNIT Sender', function () {
  // Use object to set arguments passed into callback
  var args = {};
  var requestStub = function (options, callback) {
    args.options = options;
    return callback( args.err, args.res, args.resBody );
  };
  var Sender = proxyquire(senderPath, { 'request': requestStub });

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
      var key = 'myAPIKey',
          sender = new Sender(key, options);
      expect(sender).to.be.instanceOf(Sender);
      expect(sender.key).to.equal(key);
      expect(sender.options).to.deep.equal(options);
    });

    it.skip('should do something if not passed a valid key');
  });

  describe('sendNoRetry()', function () {
    // Set arguments passed in request proxy
    function setArgs(err, res, resBody) {
      args = {
        err: err,
        res: res,
        resBody: resBody
      };
    };

    it('should set proxy, maxSockets, and/or timeout of req object if passed into constructor', function () {
      var options = {
        proxy: 'http://myproxy.com',
        maxSockets: 100,
        timeout: 1000
      };
      var sender = new Sender('mykey', options);
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', function () {});
      expect(args.options.proxy).to.equal(options.proxy);
      expect(args.options.maxSockets).to.equal(options.maxSockets);
      expect(args.options.timeout).to.equal(options.timeout);
    });

    it('should set the API key of req object if passed in API key', function () {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', function () {});
      expect(args.options.headers.Authorization).to.equal('key=myKey');
    });

    it('should stringify body of req before it is sent', function () {
      var sender = new Sender('mykey');
      var m = new Message({ collapseKey: 'Message', data: {} });
      sender.sendNoRetry(m, '', function () {});
      expect(args.options.body).to.be.a('string');
    });

    it('should set properties of body with message properties', function () {
      var mess = new Message({
        delayWhileIdle: true,
        collapseKey: 'Message',
        timeToLive: 100,
        dryRun: true,
        data: {
          name: 'Matt'
        }
      });
      var sender = new Sender('mykey');
      sender.sendNoRetry(mess, '', function () {});
      var body = JSON.parse(args.options.body);
      expect(body[Constants.PARAM_DELAY_WHILE_IDLE]).to.equal(mess.delayWhileIdle);
      expect(body[Constants.PARAM_COLLAPSE_KEY]).to.equal(mess.collapseKey);
      expect(body[Constants.PARAM_TIME_TO_LIVE]).to.equal(mess.timeToLive);
      expect(body[Constants.PARAM_DRY_RUN]).to.equal(mess.dryRun);
      expect(body[Constants.PARAM_PAYLOAD_KEY]).to.deep.equal(mess.data);
    });

    it('should set the registration_ids to reg tokens implicitly passed in', function () {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, ["registration token 1", "registration token 2"], function () {});
      var body = JSON.parse(args.options.body);
      expect(body.registration_ids).to.deep.equal(["registration token 1", "registration token 2"]);
    });

    it('should set the registration_ids to reg tokens explicitly passed in', function () {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      var regTokens = ["registration token 1", "registration token 2"];
      sender.sendNoRetry(m, { registrationIds: regTokens }, function () {});
      var body = JSON.parse(args.options.body);
      expect(body.registration_ids).to.deep.equal(regTokens);
    });

    it('should set the registration_ids to reg tokens explicitly passed in', function () {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      var regTokens = ["registration token 1", "registration token 2"];
      sender.sendNoRetry(m, { registrationTokens: regTokens }, function () {});
      var body = JSON.parse(args.options.body);
      expect(body.registration_ids).to.deep.equal(regTokens);
    });

    it('should set the to field if a single reg (or other) token is passed in', function() {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, "registration token 1", function () {});
      var body = JSON.parse(args.options.body);
      expect(body.to).to.deep.equal("registration token 1");
      expect(body.registration_ids).to.be.an("undefined");
    })

    it('should set the to field if a topic is passed in', function() {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      var topic = '/topics/tests';
      sender.sendNoRetry(m, { topic: topic }, function () {});
      var body = JSON.parse(args.options.body);
      expect(body.to).to.deep.equal(topic);
      expect(body.registration_ids).to.be.an("undefined");
    })

    it('should pass an error into callback if recipient is an empty object', function () {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {}, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.be.a('string');
    });

    it('should pass an error into callback if recipient keys are invalid', function () {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {}, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.be.a('string');
    });

    it('should pass an error into callback if request returns an error', function () {
      var callback = sinon.spy(),
          sender = new Sender('myKey');
      setArgs('an error', {}, {});
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.calledWith('an error')).to.be.ok;
    });

    it('should pass an error into callback if response does not exist', function () {
      var callback = sinon.spy(),
          sender = new Sender('myKey');
      setArgs(null, undefined, {});
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.be.a('string');
    });

    it('should return the status code as an error if returned a 500', function () {
      var callback = sinon.spy(),
          sender = new Sender('myKey');
      setArgs(null, { statusCode: 500 }, {});
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal(500);
    });

    it('should return the status code as an error if returned a 401', function () {
      var callback = sinon.spy(),
          sender = new Sender('myKey');
      setArgs(null, { statusCode: 401 }, {});
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal(401);
    });

    it('should return the status code as an error if returned a 400', function () {
      var callback = sinon.spy(),
          sender = new Sender('myKey');
      setArgs(null, { statusCode: 400 }, {});
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal(400);
    });

    it('should pass an error into the callback if resBody cannot be parsed', function () {
      var callback = sinon.spy(),
          sender = new Sender('myKey');
      setArgs(null, { statusCode: 200 }, "non-JSON string.");
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.eq('Error parsing GCM response');
    });

    it('should pass in parsed resBody into callback on success', function () {
      var callback = sinon.spy();
      var resBody = {
        message: 'woohoo!',
        success: true
      };
      var sender = new Sender('myKey');
      setArgs(null, { statusCode: 200 }, JSON.stringify(resBody));
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][1]).to.deep.equal(resBody);
    });
  });

  describe('send()', function () {
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

    before( function () {
      restore.sendNoRetry = Sender.prototype.sendNoRetry;
      Sender.prototype.sendNoRetry = function (message, reg_tokens, callback) {
        console.log('Firing send');
        args.message = message;
        args.reg_tokens = reg_tokens;
        args.tries++;
        var nextResult;
        if(!args.result) {
          nextResult = args.result;
        }
        else if(args.result.length > 1) {
          nextResult = args.result.slice(0,1)[0];
          args.result = args.result.slice(1,args.result.length);
        }
        else if(args.result.length == 1) {
          args.result = args.result[0];
          nextResult = args.result;
        }
        else {
          nextResult = args.result;
        }
        callback( args.err, nextResult );
      };
    });

    after( function () {
      Sender.prototype.sendNoRetry = restore.sendNoRetry;
    });

    it.skip('should do something if passed not an array for regTokens');

    it('should pass an error into callback if array has no regTokens', function (done) {
      var callback = function(error) {
        expect(error).to.be.a('string');
        done();
      };
      var sender = new Sender('myKey');
      sender.send({}, [], 0, callback);
    });

    it('should pass an error into callback if recipient is an empty object', function (done) {
      var callback = function(error) {
        expect(error).to.be.a('string');
        done();
      };
      var sender = new Sender('myKey');
      sender.send({}, {}, 0, callback);
    });

    it('should pass an error into callback if recipient keys are invalid', function (done) {
      var callback = function(error) {
        expect(error).to.be.a('string');
        done();
      };
      var sender = new Sender('myKey');
      sender.send({}, { invalid: ['regToken'] }, 0, callback);
    });

    it('should pass the message and the regToken to sendNoRetry on call', function () {
      var sender = new Sender('myKey'),
          message = { data: {} },
          regToken = [24];
      setArgs(null, {});
      sender.send(message, regToken, 0, function () {});
      expect(args.message).to.equal(message);
      expect(args.reg_tokens).to.equal(regToken);
      expect(args.tries).to.equal(1);
    });

    it('should pass the message and the regTokens to sendNoRetry on call', function () {
      var sender = new Sender('myKey'),
          message = { data: {} },
          regTokens = [24, 34, 44];
      setArgs(null, {});
      sender.send(message, regTokens, 0, function () {});
      expect(args.message).to.equal(message);
      expect(args.reg_tokens).to.equal(regTokens);
      expect(args.tries).to.equal(1);
    });

    it('should pass the result into callback if successful for token', function () {
      var callback = sinon.spy(),
          result = { success: true },
          sender = new Sender('myKey');
      setArgs(null, result);
      sender.send({}, [1], 0, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][1]).to.equal(result);
      expect(args.tries).to.equal(1);
    });

    it('should pass the result into callback if successful for tokens', function () {
      var callback = sinon.spy(),
          result = { success: true },
          sender = new Sender('myKey');
      setArgs(null, result);
      sender.send({}, [1, 2, 3], 0, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][1]).to.equal(result);
      expect(args.tries).to.equal(1);
    });

    it('should pass the error into callback if failure and no retry for token', function () {
      var callback = sinon.spy(),
          error = 'my error',
          sender = new Sender('myKey');
      setArgs(error);
      sender.send({}, [1], 0, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal(error);
      expect(args.tries).to.equal(1);
    });

    it('should pass the error into callback if failure and no retry for tokens', function () {
      var callback = sinon.spy(),
          error = 'my error',
          sender = new Sender('myKey');
      setArgs(error);
      sender.send({}, [1, 2, 3], 0, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][0]).to.equal(error);
      expect(args.tries).to.equal(1);
    });

    it('should retry number of times passed into call and do exponential backoff', function (done) {
      var start = new Date();
      var callback = function () {
        expect(args.tries).to.equal(2);
        expect(new Date() - start).to.be.gte(Math.pow(2, 0) * backoff);
        done();
      };
      var sender = new Sender('myKey');
      setArgs('my error');
      sender.send({ data: {}}, [1], 1, callback);
    });

    it('should retry if not all regTokens were successfully sent', function (done) {
      var callback = function () {
        expect(args.tries).to.equal(3);
        // Last call of sendNoRetry should be for only failed regTokens
        expect(args.reg_tokens.length).to.equal(1);
        expect(args.reg_tokens[0]).to.equal(3);
        done();
      };
      var sender = new Sender('myKey');
      setArgs(null, [{ results: [{}, { error: 'Unavailable' }, { error: 'Unavailable' }]}, { results: [ {}, { error: 'Unavailable' } ] }, { results: [ {} ] } ]);
      sender.send({ data: {}}, [1,2,3], {
        retries: 5,
        backoff: 100
      }, callback);
    });

    it('should retry all regTokens in event of an error', function (done) {
      var start = new Date();
      var callback = function () {
        expect(args.tries).to.equal(2);
        expect(args.reg_tokens.length).to.equal(3);
        done();
      };
      var sender = new Sender('myKey');
      setArgs('my error');
      sender.send({ data: {}}, [1,2,3], 1, callback);
    });

    it('should update the failures and successes correctly when retrying', function (done) {
      var callback = function(error, result) {
        expect(error).to.equal(null);
        expect(result.canonical_ids).to.equal(1);
        expect(result.success).to.equal(2);
        expect(result.failure).to.equal(0);
        done();
      };
      var sender = new Sender('myKey');
      setArgs(null, [
        { success: 1, failure: 2, canonical_ids: 0, results: [ {}, { error: 'Unavailable' }, { error: 'Unavailable' } ] },
        { success: 1, canonical_ids: 1, failure: 0, results: [ {}, {} ] }
      ]);
      sender.send({ data: {}}, [1,2,3], 3, callback);
    });

    it('should update the failures and successes correctly when retrying and failing some', function (done) {
      var callback = function(error, result) {
        expect(error).to.equal(null);
        expect(result.canonical_ids).to.equal(0);
        expect(result.success).to.equal(1);
        expect(result.failure).to.equal(2);
        done();
      };
      var sender = new Sender('myKey');
      setArgs(null, [
        { success: 0, failure: 3, canonical_ids: 0, results: [ { error: 'Unavailable' }, { error: 'Unavailable' }, { error: 'Unavailable' } ] },
        { success: 1, canonical_ids: 0, failure: 2, results: [ { error: 'Unavailable' }, { error: 'Unavailable' }, {} ] },
        { success: 0, canonical_ids: 0, failure: 2, results: [ { error: 'Unavailable' }, { error: 'Unavailable' } ] }
      ]);
      sender.send({ data: {}}, [1,2,3], {
        retries: 3,
        backoff: 100
      }, callback);
    });
  });
});

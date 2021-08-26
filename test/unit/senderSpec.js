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
    function setArgs(err, res, resBody) {
      args = {
        err: err,
        res: res,
        resBody: resBody
      };
    };
    before(function() {
        setArgs(null, { statusCode: 200 }, {});
    });

    it('should set proxy, maxSockets, timeout and/or strictSSL of req object if passed into constructor', function (done) {
      var options = {
        proxy: 'http://myproxy.com',
        maxSockets: 100,
        timeout: 1000,
        strictSSL: false
      };
      var sender = new Sender('mykey', options);
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', function () {});
      setTimeout(function() {
        expect(args.options.proxy).to.equal(options.proxy);
        expect(args.options.maxSockets).to.equal(options.maxSockets);
        expect(args.options.timeout).to.equal(options.timeout);
        expect(args.options.strictSSL).to.equal(options.strictSSL);
        done();
      }, 10);
    });

    it('should not override internal request params if passed into constructor (except timeout/uri)', function (done) {
      var options = {
        method: 'GET',
        headers: {
            Authorization: 'test'
        },
        json: { test: true }
      };
      var sender = new Sender('mykey', options);
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', function () {});
      setTimeout(function() {
        expect(args.options.method).to.not.equal(options.method);
        expect(args.options.headers).to.not.deep.equal(options.headers);
        expect(args.options.json).to.not.equal(options.json);
        done();
      }, 10);
    });

    it('should not override internal request headers if passed into constructor', function (done) {
      var options = {
        headers: {
            Authorization: 'test'
        }
      };
      var sender = new Sender('mykey', options);
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', function () {});
      setTimeout(function() {
        expect(args.options.headers.Authorization).to.not.equal(options.headers.Auhtorization);
        done();
      }, 10);
    });

    it('should allow extending request headers if passed into constructor', function (done) {
      var options = {
        headers: {
            Custom: true
        }
      };
      var sender = new Sender('mykey', options);
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', function () {});
      setTimeout(function() {
        expect(args.options.headers.Custom).to.deep.equal(options.headers.Custom);
        done();
      }, 10);
    });

    it('should allow override for "uri" if passed into constructor via options', function (done) {
      var options = {
        uri: 'http://example.com'
      };
      var sender = new Sender('mykey', options);
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', function () {});
      setTimeout(function() {
        expect(args.options.uri).to.be.equal(options.uri);
        done();
      }, 10);
    });

    it('should default "uri" to FCM send uri if not overridden', function (done) {
      var sender = new Sender('mykey');
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', function () {});
      setTimeout(function() {
        expect(args.options.uri).to.be.equal(Constants.GCM_SEND_URI);
        done();
      }, 10);
    });

    it('should not set strictSSL of req object if not passed into constructor', function (done) {
      var options = {
        proxy: 'http://myproxy.com',
        maxSockets: 100,
        timeout: 1000
      };
      var sender = new Sender('mykey', options);
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', function () {});
      setTimeout(function() {
        expect(args.options.strictSSL).to.be.an('undefined');
        done();
      }, 10);
    });

    it('should set the API key of req object if passed in API key', function (done) {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', function () {});
      setTimeout(function() {
        expect(args.options.headers.Authorization).to.equal('key=myKey');
        done();
      }, 10);
    });

    it('should send a JSON object as the body of the request', function (done) {
      var sender = new Sender('mykey');
      var m = new Message({ collapseKey: 'Message', data: {} });
      sender.sendNoRetry(m, '', function () {});
      setTimeout(function() {
        expect(args.options.json).to.be.a('object');
        done();
      }, 10);
    });

    it('should set properties of body with message properties', function (done) {
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
      setTimeout(function() {
        var body = args.options.json;
        expect(body[Constants.PARAM_DELAY_WHILE_IDLE]).to.equal(mess.delayWhileIdle);
        expect(body[Constants.PARAM_COLLAPSE_KEY]).to.equal(mess.collapseKey);
        expect(body[Constants.PARAM_TIME_TO_LIVE]).to.equal(mess.timeToLive);
        expect(body[Constants.PARAM_DRY_RUN]).to.equal(mess.dryRun);
        expect(body[Constants.PARAM_PAYLOAD_KEY]).to.deep.equal(mess.data);
        done();
      }, 10);
    });

    it('should set the registration_ids to reg tokens implicitly passed in', function (done) {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, ["registration token 1", "registration token 2"], function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.registration_ids).to.deep.equal(["registration token 1", "registration token 2"]);
        done();
      }, 10);
    });

    it('should set the registration_ids to reg tokens explicitly passed in', function (done) {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      var regTokens = ["registration token 1", "registration token 2"];
      sender.sendNoRetry(m, { registrationIds: regTokens }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.registration_ids).to.deep.equal(regTokens);
        done();
      }, 10);
    });

    it('should set the registration_ids to reg tokens explicitly passed in', function (done) {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      var regTokens = ["registration token 1", "registration token 2"];
      sender.sendNoRetry(m, { registrationTokens: regTokens }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.registration_ids).to.deep.equal(regTokens);
        done();
      }, 10);
    });

    it('should set the to field if a single reg (or other) token is passed in', function(done) {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, "registration token 1", function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.to).to.deep.equal("registration token 1");
        expect(body.registration_ids).to.be.an("undefined");
        done();
      }, 10);
    })

    it('should set the to field if a single reg token is passed in as a string', function(done) {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      var token = "registration token 1";
      sender.sendNoRetry(m, token, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.to).to.deep.equal(token);
        expect(body.registration_ids).to.be.an("undefined");
        done();
      }, 10);
    })

    it('should set the to field if a single reg token is passed inside the recipient array', function(done) {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      var token = "registration token 1";
      sender.sendNoRetry(m, [ token ], function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.to).to.deep.equal(token);
        expect(body.registration_ids).to.be.an("undefined");
        done();
      }, 10);
    })

    it('should set the to field if a single reg token is passed inside the registrationTokens array', function(done) {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      var token = "registration token 1";
      sender.sendNoRetry(m, { registrationTokens: token }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.to).to.deep.equal(token);
        expect(body.registration_ids).to.be.an("undefined");
        done();
      }, 10);
    })

    it('should set the to field if a single reg token is passed inside the registrationIDs array', function(done) {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      var token = "registration token 1";
      sender.sendNoRetry(m, { registrationIDs: token }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.to).to.deep.equal(token);
        expect(body.registration_ids).to.be.an("undefined");
        done();
      }, 10);
    })

    it('should set the to field if a topic is passed in', function(done) {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      var topic = '/topics/tests';
      sender.sendNoRetry(m, { topic: topic }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.to).to.deep.equal(topic);
        expect(body.registration_ids).to.be.an("undefined");
        done();
      }, 10);
    })

    it('should set the to field if a to recipient is passed in', function(done) {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      var token = "registration token 1";
      sender.sendNoRetry(m, { to: token }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.to).to.deep.equal(token);
        expect(body.registration_ids).to.be.an("undefined");
        done();
      }, 10);
    })

    it('should set the condition field if multiple topics are passed in', function(done) {
      var sender = new Sender('myKey');
      var m = new Message({ data: {} });
      var topics = "'TopicA' in topics && ('TopicB' in topics || 'TopicC' in topics)";
      sender.sendNoRetry(m, { condition: topics }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.condition).to.deep.equal(topics);
        expect(body.to).to.be.an("undefined");
        expect(body.registration_ids).to.be.an("undefined");
        done();
      }, 10);
    })

    it('should pass an error into callback if recipient is an empty object', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {}, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.instanceOf(Error);
        done();
      }, 10);
    });

    it('should pass an error into callback if recipient keys are invalid', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {invalid: true}, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.instanceOf(Error);
        done();
      }, 10);
    });

    it('should pass an error into callback if provided more than one recipient key', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {registrationIds: ['string'], topic: 'string'}, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.instanceOf(Error);
        done();
      }, 10);
    });

    it('should pass an error into callback if registrationIds is not an array', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {registrationIds: 'string'}, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.instanceOf(Error);
        done();
      }, 10);
    });

    it('should pass an error into callback if registrationTokens is not an array', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {registrationTokens: 'string'}, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.instanceOf(Error);
        done();
      }, 10);
    });

    it('should pass an error into callback if to is not a string', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {to: ['array']}, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.instanceOf(Error);
        done();
      }, 10);
    });

    it('should pass an error into callback if topic is not a string', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {topic: ['array']}, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.instanceOf(Error);
        done();
      }, 10);
    });

    it('should pass an error into callback if notificationKey is not a string', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {notificationKey: ['array']}, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.instanceOf(Error);
        done();
      }, 10);
    });

    it('should pass an error into callback if to is empty', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {to: ''}, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.instanceOf(Error);
        done();
      }, 10);
    });

    it('should pass an error into callback if topic is empty', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {topic: ''}, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.instanceOf(Error);
        done();
      }, 10);
    });

    it('should pass an error into callback if notificationKey is empty', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {notificationKey: ''}, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.instanceOf(Error);
        done();
      }, 10);
    });

    it('should pass an error into callback if no recipient provided', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.sendNoRetry(new Message(), {}, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.instanceOf(Error);
        done();
      }, 10);
    });

    it('should pass an error into callback if request returns an error', function (done) {
      var callback = sinon.spy(),
          sender = new Sender('myKey');
      setArgs('an error', {}, {});
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.calledWith('an error')).to.be.ok;
        done();
      }, 10);
    });

    it('should return the status code as an error if returned a 500', function (done) {
      var callback = sinon.spy(),
          sender = new Sender('myKey');
      setArgs(null, { statusCode: 500 }, {});
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.equal(500);
        done();
      }, 10);
    });

    it('should return the status code as an error if returned a 401', function (done) {
      var callback = sinon.spy(),
          sender = new Sender('myKey');
      setArgs(null, { statusCode: 401 }, {});
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.equal(401);
        done();
      }, 10);
    });

    it('should return the status code as an error if returned a 400', function (done) {
      var callback = sinon.spy(),
          sender = new Sender('myKey');
      setArgs(null, { statusCode: 400 }, {});
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.equal(400);
        done();
      }, 10);
    });

    it('should pass an error into the callback if resBody cannot be parsed', function (done) {
      var callback = sinon.spy(),
          sender = new Sender('myKey'),
          parseError = {error: 'Failed to parse JSON'};
      setArgs(parseError, null, null);
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.deep.equal(parseError);
        done();
      }, 10);
    });

    it('should pass in parsed resBody into callback on success', function (done) {
      var callback = sinon.spy();
      var resBody = {
        message: 'woohoo!',
        success: true
      };
      var sender = new Sender('myKey');
      setArgs(null, { statusCode: 200 }, resBody);
      var m = new Message({ data: {} });
      sender.sendNoRetry(m, '', callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][1]).to.deep.equal(resBody);
        done();
      }, 10);
    });
  });

  describe('send()', function () {
    var restore = {},
        backoff = Constants.BACKOFF_INITIAL_DELAY;
    // Set args passed into sendNoRetry
    function setArgs(err, response) {
      args = {
        err: err,
        response: response,
        tries: 0
      };
    };

    before( function () {
      restore.sendNoRetry = Sender.prototype.sendNoRetry;
      Sender.prototype.sendNoRetry = function (message, reg_tokens, callback) {
        args.message = message;
        args.reg_tokens = reg_tokens;
        args.tries++;
        var nextResponse;
        if(!args.response) {
          nextResponse = args.response;
        }
        else if(args.response.length > 1) {
          nextResponse = args.response.slice(0,1)[0];
          args.response = args.response.slice(1,args.response.length);
        }
        else if(args.response.length == 1) {
          args.response = args.response[0];
          nextResponse = args.response;
        }
        else {
          nextResponse = args.response;
        }
        callback( args.err, nextResponse, args.reg_tokens );
      };
    });

    after( function () {
      Sender.prototype.sendNoRetry = restore.sendNoRetry;
    });

    it('should pass reg tokens to sendNoRetry, even if it is an empty array', function (done) {
      var emptyRegTokenArray = [];
      var callback = function(error) {
        expect(args.reg_tokens).to.equal(emptyRegTokenArray);
        done();
      };
      var sender = new Sender('myKey');
      sender.send({}, emptyRegTokenArray, 0, callback);
    });

    it('should pass reg tokens to sendNoRetry, even if it is an empty object', function (done) {
      var emptyRegTokenObject = {};
      var callback = function(error) {
        expect(args.reg_tokens).to.equal(emptyRegTokenObject);
        done();
      };
      var sender = new Sender('myKey');
      sender.send({}, emptyRegTokenObject, 0, callback);
    });

    it('should pass reg tokens to sendNoRetry, even if some keys are invalid', function (done) {
      var invalidRegTokenObject = { invalid: ['regToken'] };
      var callback = function(error) {
        expect(args.reg_tokens).to.equal(invalidRegTokenObject);
        done();
      };
      var sender = new Sender('myKey');
      sender.send({}, invalidRegTokenObject, 0, callback);
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

    it('should pass the response into callback if successful for token', function () {
      var callback = sinon.spy(),
          response = { success: true },
          sender = new Sender('myKey');
      setArgs(null, response);
      sender.send({}, [1], 0, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][1]).to.equal(response);
      expect(args.tries).to.equal(1);
    });

    it('should pass the response into callback if successful for tokens', function () {
      var callback = sinon.spy(),
          response = { success: true },
          sender = new Sender('myKey');
      setArgs(null, response);
      sender.send({}, [1, 2, 3], 0, callback);
      expect(callback.calledOnce).to.be.ok;
      expect(callback.args[0][1]).to.equal(response);
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

    it('should retry if some regTokens were failed with InternalServerError', function (done) {
      var callback = function () {
        expect(args.tries).to.equal(3);
        // Last call of sendNoRetry should be for only failed regTokens
        expect(args.reg_tokens.length).to.equal(1);
        expect(args.reg_tokens[0]).to.equal(3);
        done();
      };
      var sender = new Sender('myKey');
      setArgs(null, [{ results: [{}, { error: 'InternalServerError' }, { error: 'InternalServerError' }]}, { results: [ {}, { error: 'InternalServerError' } ] }, { results: [ {} ] } ]);
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
      var callback = function(error, response) {
        expect(error).to.equal(null);
        expect(response.canonical_ids).to.equal(1);
        expect(response.success).to.equal(2);
        expect(response.failure).to.equal(0);
        done();
      };
      var sender = new Sender('myKey');
      setArgs(null, [
        { success: 1, failure: 2, canonical_ids: 0, results: [ {}, { error: 'Unavailable' }, { error: 'Unavailable' } ] },
        { success: 1, canonical_ids: 1, failure: 0, results: [ {}, {} ] }
      ]);
      sender.send({ data: {}}, [1,2,3], 3, callback);
    });

    it('should update the failures and successes correctly when retrying for InternalServerError response', function (done) {
      var callback = function(error, response) {
        expect(error).to.equal(null);
        expect(response.canonical_ids).to.equal(1);
        expect(response.success).to.equal(2);
        expect(response.failure).to.equal(0);
        done();
      };
      var sender = new Sender('myKey');
      setArgs(null, [
        { success: 1, failure: 2, canonical_ids: 0, results: [ {}, { error: 'InternalServerError' }, { error: 'InternalServerError' } ] },
        { success: 1, canonical_ids: 1, failure: 0, results: [ {}, {} ] }
      ]);
      sender.send({ data: {}}, [1,2,3], 3, callback);
    });

    it('should update the failures and successes correctly when retrying and failing some', function (done) {
      var callback = function(error, response) {
        expect(error).to.equal(null);
        expect(response.canonical_ids).to.equal(0);
        expect(response.success).to.equal(1);
        expect(response.failure).to.equal(2);
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

    it('should update the failures and successes correctly when retrying and failing some with InternalServerError response', function (done) {
      var callback = function(error, response) {
        expect(error).to.equal(null);
        expect(response.canonical_ids).to.equal(0);
        expect(response.success).to.equal(1);
        expect(response.failure).to.equal(2);
        done();
      };
      var sender = new Sender('myKey');
      setArgs(null, [
        { success: 0, failure: 3, canonical_ids: 0, results: [ { error: 'InternalServerError' }, { error: 'InternalServerError' }, { error: 'InternalServerError' } ] },
        { success: 1, canonical_ids: 0, failure: 2, results: [ { error: 'InternalServerError' }, { error: 'InternalServerError' }, {} ] },
        { success: 0, canonical_ids: 0, failure: 2, results: [ { error: 'InternalServerError' }, { error: 'InternalServerError' } ] }
      ]);
      sender.send({ data: {}}, [1,2,3], {
        retries: 3,
        backoff: 100
      }, callback);
    });
  });
});

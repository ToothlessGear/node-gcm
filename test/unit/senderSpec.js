"use strict";

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    senderPath = '../../lib/sender';

describe('UNIT Sender', function () {
  // Use object to set arguments passed into callback
  var args = {};
  var requestStub = function (options, callback) {
    args.options = options;
    return callback( args.err, args.res, args.resBody );
  };
  var Sender = proxyquire(senderPath, { 'request': requestStub });

  describe('constructor', function () {
    var gcm = require(senderPath);

    it('should call new on constructor if user does not', function () {
      var sender = gcm();
      expect(sender).to.not.be.undefined;
      expect(sender).to.be.instanceOf(gcm);
    });

    it('should create a Sender with key and options passed in', function () {
      var options = {
        proxy: 'http://myproxy.com',
        maxSockets: 100,
        timeout: 100
      };
      var key = 'myAPIKey',
          sender = new gcm(key, options);
      expect(sender).to.be.instanceOf(gcm);
      expect(sender.key).to.equal(key);
      expect(sender.options).to.deep.equal(options);
    });
  });

  describe('send() without retries', function () {
    function setArgs(err, res, resBody) {
      args = {
        err: err,
        res: res,
        resBody: resBody
      };
    }
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
      var m = { data: {} };
      sender.send(m, '', { retries: 0 }, function () {});
      setTimeout(function() {
        expect(args.options.proxy).to.equal(options.proxy);
        expect(args.options.maxSockets).to.equal(options.maxSockets);
        expect(args.options.timeout).to.equal(options.timeout);
        expect(args.options.strictSSL).to.equal(options.strictSSL);
        done();
      }, 10);
    });

    it('should not override internal request params if passed into constructor (except timeout)', function (done) {
      var options = {
        method: 'GET',
        headers: {
            Authorization: 'test'
        },
        uri: 'http://example.com',
        json: { test: true }
      };
      var sender = new Sender('mykey', options);
      var m = { data: {} };
      sender.send(m, '', { retries: 0 }, function () {});
      setTimeout(function() {
        expect(args.options.method).to.not.equal(options.method);
        expect(args.options.headers).to.not.deep.equal(options.headers);
        expect(args.options.uri).to.not.equal(options.uri);
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
      var m = { data: {} };
      sender.send(m, '', { retries: 0 }, function () {});
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
      var m = { data: {} };
      sender.send(m, '', { retries: 0 }, function () {});
      setTimeout(function() {
        expect(args.options.headers.Custom).to.deep.equal(options.headers.Custom);
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
      var m = { data: {} };
      sender.send(m, '', { retries: 0 }, function () {});
      setTimeout(function() {
        expect(args.options.strictSSL).to.be.an('undefined');
        done();
      }, 10);
    });

    it('should set the API key of req object if passed in API key', function (done) {
      var sender = new Sender('myKey');
      var m = { data: {} };
      sender.send(m, '', { retries: 0 }, function () {});
      setTimeout(function() {
        expect(args.options.headers.Authorization).to.equal('key=myKey');
        done();
      }, 10);
    });

    it('should send a JSON object as the body of the request', function (done) {
      var sender = new Sender('mykey');
      var m = { collapseKey: 'Message', data: {} };
      sender.send(m, '', { retries: 0 }, function () {});
      setTimeout(function() {
        expect(args.options.json).to.be.a('object');
        done();
      }, 10);
    });

    it('should set properties of body with message properties', function (done) {
      var mess = {
        delay_while_idle: true,
        collapse_key: 'Message',
        time_to_live: 100,
        dry_run: true,
        data: {
          name: 'Matt'
        }
      };
      var sender = new Sender('mykey');
      sender.send(mess, '', { retries: 0 }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.delay_while_idle).to.equal(mess.delay_while_idle);
        expect(body.collapse_key).to.equal(mess.collapse_key);
        expect(body.time_to_live).to.equal(mess.time_to_live);
        expect(body.dry_run).to.equal(mess.dry_run);
        expect(body.data).to.deep.equal(mess.data);
        done();
      }, 10);
    });

    it('should ignore properties of body that are unknown or invalid types', function(done) {
        var mess = {
        delay_while_idle: "a string",
        collapse_key: true,
        time_to_live: 100,
        dry_run: true,
        data: {
          name: 'Matt'
        },
        unknown_property: "hello"
      };
      var sender = new Sender('mykey');
      sender.send(mess, '', { retries: 0 }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.delay_while_idle).to.equal(undefined);
        expect(body.collapse_key).to.equal(undefined);
        expect(body.time_to_live).to.equal(mess.time_to_live);
        expect(body.dry_run).to.equal(mess.dry_run);
        expect(body.data).to.deep.equal(mess.data);
        expect(body.unknown_property).to.equal(undefined);
        done();
      }, 10);
    });

    it('should set the registration_ids to reg tokens implicitly passed in', function (done) {
      var sender = new Sender('myKey');
      var m = { data: {} };
      sender.send(m, ["registration token 1", "registration token 2"], { retries: 0 }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.registration_ids).to.deep.equal(["registration token 1", "registration token 2"]);
        done();
      }, 10);
    });

    it('should set the registration_ids to reg tokens explicitly passed in', function (done) {
      var sender = new Sender('myKey');
      var m = { data: {} };
      var regTokens = ["registration token 1", "registration token 2"];
      sender.send(m, { registrationIds: regTokens }, { retries: 0 }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.registration_ids).to.deep.equal(regTokens);
        done();
      }, 10);
    });

    it('should set the registration_ids to reg tokens explicitly passed in', function (done) {
      var sender = new Sender('myKey');
      var m = { data: {} };
      var regTokens = ["registration token 1", "registration token 2"];
      sender.send(m, { registrationTokens: regTokens }, { retries: 0 }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.registration_ids).to.deep.equal(regTokens);
        done();
      }, 10);
    });

    it('should set the to field if a single reg (or other) token is passed in', function(done) {
      var sender = new Sender('myKey');
      var m = { data: {} };
      sender.send(m, "registration token 1", { retries: 0 }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.to).to.deep.equal("registration token 1");
        expect(body.registration_ids).to.be.an("undefined");
        done();
      }, 10);
    })

    it('should set the to field if a single reg token is passed in as a string', function(done) {
      var sender = new Sender('myKey');
      var m = { data: {} };
      var token = "registration token 1";
      sender.send(m, token, { retries: 0 }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.to).to.deep.equal(token);
        expect(body.registration_ids).to.be.an("undefined");
        done();
      }, 10);
    })

    it('should set the registration_id field if a single reg token is passed inside the recipient array', function(done) {
      var sender = new Sender('myKey');
      var m = { data: {} };
      var token = "registration token 1";
      sender.send(m, [ token ], { retries: 0 }, function () {});
      setTimeout(function() {
        var body = args.options.json;
        expect(body.registration_ids).to.deep.equal([ token ]);
        expect(body.to).to.be.an("undefined");
        done();
      }, 10);
    })

    it('should pass an error into callback if recipient is an empty object', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.send({}, {}, { retries: 0 }, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.a('object');
        done();
      }, 10);
    });

    it('should pass an error into callback if no recipient provided', function (done) {
      var callback = sinon.spy();
      var sender = new Sender('myKey');
      sender.send({}, [], { retries: 0 }, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.be.a('object');
        done();
      }, 10);
    });

    it('should pass an error into callback if request returns an error', function (done) {
      var callback = sinon.spy(),
          sender = new Sender('myKey');
      setArgs('an error', {}, {});
      var m = { data: {} };
      sender.send(m, '', { retries: 0 }, callback);
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
      var m = { data: {} };
      sender.send(m, '', { retries: 0 }, callback);
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
      var m = { data: {} };
      sender.send(m, '', { retries: 0 }, callback);
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
      var m = { data: {} };
      sender.send(m, '', { retries: 0 }, callback);
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
      var m = { data: {} };
      sender.send(m, '', { retries: 0 }, callback);
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
      var m = { data: {} };
      sender.send(m, '', { retries: 0 }, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][1]).to.deep.equal(resBody);
        done();
      }, 10);
    });
  });

  describe('send()', function () {
    function setArgs(err, res, resBody) {
      args = {
        err: err,
        res: res,
        resBody: resBody
      };
    }

    before(function() {
      setArgs(null, { statusCode: 200 }, {});
    });

    it('should pass the response into callback if successful for token', function (done) {
      var callback = sinon.spy(),
          response = { success: true },
          sender = new Sender('myKey');
      setArgs(null, response);
      sender.send({}, [1], 0, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][1]).to.equal(response);
        expect(args.tries).to.equal(1);
        done();
      }, 10);
    });

    it('should pass the response into callback if successful for tokens', function (done) {
      var callback = sinon.spy(),
          response = { success: true },
          sender = new Sender('myKey');
      setArgs(null, response);
      sender.send({}, [1, 2, 3], 0, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][1]).to.equal(response);
        expect(args.tries).to.equal(1);
        done();
      }, 10);
    });

    it('should pass the error into callback if failure and no retry for token', function (done) {
      var callback = sinon.spy(),
          error = 'my error',
          sender = new Sender('myKey');
      setArgs(error);
      sender.send({}, [1], 0, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.equal(error);
        expect(args.tries).to.equal(1);
        done();
      }, 10);
    });

    it('should pass the error into callback if failure and no retry for tokens', function (done) {
      var callback = sinon.spy(),
          error = 'my error',
          sender = new Sender('myKey');
      setArgs(error);
      sender.send({}, [1, 2, 3], 0, callback);
      setTimeout(function() {
        expect(callback.calledOnce).to.be.ok;
        expect(callback.args[0][0]).to.equal(error);
        expect(args.tries).to.equal(1);
        done();
      }, 10);
    });

    it('should retry number of times passed into call and do exponential backoff', function (done) {
      var start = new Date();
      var callback = function () {
        expect(args.tries).to.equal(2);
        expect(new Date() - start).to.be.gte(1000);
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
  });
});

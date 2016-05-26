"use strict";

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    instanceIdPath = '../../lib/instance-id',
    Constants = require('../../lib/constants');

describe('UNIT InstanceId', function () {
  // Use object to set arguments passed into callback
  var args = {};
  var requestStub = function (options, callback) {
    args.options = options;
    return callback( args.err, args.res, args.resBody );
  };

  var InstanceId = proxyquire(instanceIdPath, { 'request': requestStub });

  describe('constructor', function () {
    var InstanceId = require(instanceIdPath);

    it('should call new on constructor if user does not', function () {
      var instanceId = InstanceId();
      expect(instanceId).to.not.be.undefined;
      expect(instanceId).to.be.instanceOf(InstanceId);
    });

    it('should create a InstanceId with key and options passed in', function () {
      var options = {
        proxy: 'http://myproxy.com',
        maxSockets: 100,
        timeout: 100
      };
      var key = 'myAPIKey',
      instanceId = new InstanceId(key, options);
      expect(instanceId).to.be.instanceOf(InstanceId);
      expect(instanceId.key).to.equal(key);
      expect(instanceId.options).to.deep.equal(options);
    });

    it.skip('should do something if not passed a valid key');
  });


  describe('addToTopicNoRetry()', function () {
    // Set arguments passed in request proxy
    function setArgs(err, res, resBody) {
      args = {
        err: err,
        res: res,
        resBody: resBody
      };
    };


      

    
  });

});
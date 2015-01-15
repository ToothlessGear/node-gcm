"use strict";

var Message = require('../../lib/message'),
    chai = require('chai'),
    expect = chai.expect;

describe('UNIT Message', function () {
  describe('constructor', function () {
    it('should create an empty message with a data object if not passed an object', function () {
      var mess = new Message();
      expect(mess.collapseKey).to.be.undefined;
      expect(mess.delayWhileIdle).to.be.undefined;
      expect(mess.timeToLive).to.be.undefined;
      expect(mess.dryRun).to.be.undefined;
      expect(mess.data).to.deep.equal({});
    });

    it('should call new on constructor if user does not', function () {
      var mess = Message();
      expect(mess).to.not.be.undefined;
      expect(mess).to.be.instanceOf(Message);
    });

    it('should create an message with properties passed in', function () {
      var obj = {
        collapseKey: 'Message',
        delayWhileIdle: true,
        timeToLive: 100,
        dryRun: true,
        data: {
          score: 98
        }
      };
      var mess = new Message(obj);
      expect(JSON.stringify(mess)).to.equal(JSON.stringify(obj));
    });

    it('should only set properties passed into constructor', function () {
      var obj = {
        collapseKey: 'Message',
        delayWhileIdle: true,
        data: {
          score: 98
        }
      };
      var mess = new Message(obj);
      expect(JSON.stringify(mess)).to.equal(JSON.stringify(obj));
      expect(mess.timeToLive).to.be.undefined;
      expect(mess.dryRun).to.be.undefined;
    });
  });

  describe('addData()', function () {
    it('should add properties to the message data object given a key and value', function () {
      var mess = new Message();
      mess.addData('myKey', 'Message');
      expect(mess.data.myKey).to.equal('Message');
    });

    it('should only set values on data object, not top level message', function () {
      var mess = new Message();
      mess.addData('collapseKey', 'Message');
      expect(mess.collapseKey).to.not.equal('Message');
      expect(mess.data.collapseKey).to.equal('Message');
    });

    it('should set the data property to the object passed in', function () {
      var mess = new Message();
      var obj = {
        message: 'hello',
        key: 'value'
      };
      mess.addData(obj);
      expect(mess.data).to.deep.equal(obj);
    });

    it('should overwrite data object when an object is passed in', function () {
      var data = {
        message: 'hello',
        key: 'value'
      };
      var mess = new Message({ data: { message: 'bye', prop: 'none' } });
      mess.addData(data);
      expect(mess.data).to.deep.equal(data);
    });

    it('should not overwrite data if not passed an object', function () {
      var data = {
        message: 'hello',
        key: 'value'
      };
      var mess = new Message({ data: data });
      mess.addData('adding');
      expect(mess.data).to.deep.equal(data);
    });

    it('should not overwrite data if passed an empty object', function () {
      var data = {
        message: 'hello',
        key: 'value'
      };
      var mess = new Message({ data: data });
      mess.addData({});
      expect(mess.data).to.deep.equal(data);
    });

    it.skip('should do something if not called properly');
  });

  describe('addDataWithKeyValue()', function () {
    it('should add properties to the message data object given a key and value', function () {
      var mess = new Message();
      mess.addDataWithKeyValue('myKey', 'Message');
      expect(mess.data.myKey).to.equal('Message');
    });

    it('should only set values on data object, not top level message', function () {
      var mess = new Message();
      mess.addDataWithKeyValue('collapseKey', 'Message');
      expect(mess.collapseKey).to.not.equal('Message');
      expect(mess.data.collapseKey).to.equal('Message');
    });

    it.skip('should do something if not called properly');
  });

  describe('addDataWithObject()', function () {
    it('should set the data property to the object passed in', function () {
      var mess = new Message();
      var obj = {
        message: 'hello',
        key: 'value'
      };
      mess.addDataWithObject(obj);
      expect(mess.data).to.deep.equal(obj);
    });

    it('should overwrite data object when an object is passed in', function () {
      var data = {
        message: 'hello',
        key: 'value'
      };
      var mess = new Message({ data: { message: 'bye', prop: 'none' } });
      mess.addDataWithObject(data);
      expect(mess.data).to.deep.equal(data);
    });

    it('should not overwrite data if not passed an object', function () {
      var data = {
        message: 'hello',
        key: 'value'
      };
      var mess = new Message({ data: data });
      mess.addDataWithObject('adding');
      expect(mess.data).to.deep.equal(data);
    });

    it('should not overwrite data if passed an empty object', function () {
      var data = {
        message: 'hello',
        key: 'value'
      };
      var mess = new Message({ data: data });
      mess.addDataWithObject({});
      expect(mess.data).to.deep.equal(data);
    });
  });
});
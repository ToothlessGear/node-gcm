/*!
 * node-gcm
 * Copyright(c) 2013 Marcus Farkas <toothlessgear@finitebox.com>
 * MIT Licensed
 */
var Constants = require('./constants');
var req = require('request');
var debug = require('debug')('node-gcm');
var SenderBase = require('./sender_base');

function Sender(key, options) {
    if (!(this instanceof Sender)) {
        return new Sender(key, options);
    }

    this.key = key;
    this.options = options;
    this.senderBase = new SenderBase(key, options);
}

Sender.prototype.sendNoRetry = function(message, registrationIds, callback) {
    var recipient = {registrationIds: registrationIds};
    return this.senderBase.sendNoRetry(message, recipient, callback);
};

Sender.prototype.send = function(message, registrationIds, retries, callback) {
    var recipient = {registrationIds: registrationIds};
    return this.senderBase.send(message, recipient, retries, callback);
};

module.exports = Sender;
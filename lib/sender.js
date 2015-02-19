/*!
 * node-gcm
 * Copyright(c) 2013 Marcus Farkas <toothlessgear@finitebox.com>
 * MIT Licensed
 */
var SenderBase = require('./sender_base');
var req = require('request');

function Sender(key, options) {
    if (!(this instanceof Sender)) {
        return new Sender(key, options);
    }

    this.req = req;
    SenderBase.call(this, key, options);
}

Sender.prototype = Object.create(SenderBase.prototype);
Sender.prototype.constructor = Sender;

Sender.prototype.sendNoRetry = function(message, registrationIds, callback) {
    var recipient = {registrationIds: registrationIds};
    return this.sendBaseNoRetry(message, recipient, callback);
};

Sender.prototype.send = function(message, registrationIds, retries, callback) {
    var recipient = {registrationIds: registrationIds};
    return this.sendBase(message, recipient, retries, callback);
};

module.exports = Sender;
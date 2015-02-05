/*!
 * node-gcm
 * Copyright(c) 2013 Marcus Farkas <toothlessgear@finitebox.com>
 * MIT Licensed
 */
var Constants = require('./constants');
var req = require('request');
var debug = require('debug')('node-gcm');
var SenderBase = require('./sender_base');

function UserNotificationSender(key, options) {
    if (!(this instanceof UserNotificationSender)) {
        return new Sender(key, options);
    }

    this.key = key;
    this.options = options;
    this.senderBase = new SenderBase(key, options);
}

UserNotificationSender.prototype.sendNoRetry = function(message, notificationKey, callback) {
    var recipient = {notificationKey: notificationKey};
    return this.senderBase.sendNoRetry(message, recipient, callback);
};

UserNotificationSender.prototype.send = function(message, notificationKey, retries, callback) {
    var recipient = {notificationKey: notificationKey};
    return this.senderBase.send(message, recipient, retries, callback);
};

module.exports = UserNotificationSender;
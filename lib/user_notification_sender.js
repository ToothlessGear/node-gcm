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
        return new UserNotificationSender(key, options);
    }

    this.prototype = new SenderBase(key, options);
    this.key = key;
    this.options = options;
}

UserNotificationSender.prototype.sendNoRetry = function(message, notificationKey, callback) {
    var recipient = notificationKey instanceof String ? {notificationKey: notificationKey} : notificationKey;
    return SenderBase.prototype.sendNoRetry.call(this, message, recipient, callback);
};

UserNotificationSender.prototype.send = function(message, notificationKey, retries, callback) {
    var recipient = {notificationKey: notificationKey};
    return SenderBase.prototype.send.call(this, message, recipient, retries, callback);
};

module.exports = UserNotificationSender;
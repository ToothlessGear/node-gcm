/*!
 * node-gcm
 * Copyright(c) 2013 Marcus Farkas <toothlessgear@finitebox.com>
 * MIT Licensed
 */
var SenderBase = require('./sender_base');
var req = require('request');

function UserNotificationSender(key, options) {
    if (!(this instanceof UserNotificationSender)) {
        return new UserNotificationSender(key, options);
    }

    this.req = req;
    SenderBase.call(this, key, options);
}

UserNotificationSender.prototype = Object.create(SenderBase.prototype);
UserNotificationSender.prototype.constructor = UserNotificationSender;

UserNotificationSender.prototype.sendNoRetry = function(message, notificationKey, callback) {
    var recipient = notificationKey instanceof String ? {notificationKey: notificationKey} : notificationKey;
    return this.sendBaseNoRetry(message, recipient, callback);
};

UserNotificationSender.prototype.send = function(message, notificationKey, retries, callback) {
    var recipient = {notificationKey: notificationKey};
    return this.sendBase(message, recipient, retries, callback);
};

module.exports = UserNotificationSender;
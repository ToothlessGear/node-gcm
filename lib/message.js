/*!
 * node-gcm
 * Copyright(c) 2012 Marcus Farkas <marcus.farkas@spaceteam.at>
 * MIT Licensed
 */


function Message(obj) {
    this.collapseKey = obj.collapseKey || undefined;
    this.delayWhileIdle = obj.delayWhileIdle || undefined;
    this.timeToLive = obj.timeToLive || undefined;
    this.data = obj.data || {};

    if (Object.keys(data).length > 0) {
        this.hasData = true;
    } else {
        this.hasData = false;
    }
}

Message.prototype.addDataWithKeyValue = function (key, value) {
    this.hasData = true;
    this.data[key] = value.toString();
};

Message.prototype.addDataWithObject = function (obj) {
    if (typeof obj === 'object' && Object.keys(obj).length > 0) {
        this.data = obj;
        this.hasData = true;
    }
};

module.exports = Message;
/*!
 * node-gcm
 * Copyright(c) 2013 Marcus Farkas <toothlessgear@finitebox.com>
 * MIT Licensed
 */


function Message(obj) {
    if (!(this instanceof Message)) {
        return new Message(obj);
    }

    if (!obj) {
        obj = {};
    }

    this.collapseKey = obj.collapseKey || undefined;
    this.delayWhileIdle = obj.delayWhileIdle || undefined;
    this.timeToLive = obj.timeToLive || undefined;
    this.dryRun = obj.dryRun || undefined;
    this.data = obj.data || {};
}

Message.prototype.addData = Message.prototype.addDataWithKeyValue = function (key, value) {
    this.data[key] = value;
    return this;
};

Message.prototype.addDataWithObject = function (obj) {
    if (typeof obj === 'object' && Object.keys(obj).length > 0) {
        this.data = obj;
    }
    return this;
};

module.exports = Message;

/*!
 * node-gcm
 * Copyright(c) 2013 Marcus Farkas <toothlessgear@finitebox.com>
 * MIT Licensed
 */


function Message(obj) {
    if (obj) {
        this.collapseKey = obj.collapseKey || undefined;
        this.delayWhileIdle = obj.delayWhileIdle || undefined;
        this.timeToLive = obj.timeToLive || undefined;
        this.dryRun = obj.dryRun || undefined;
        this.data = obj.data || {};
    } else {
        this.collapseKey = undefined;
        this.delayWhileIdle = undefined;
        this.timeToLive = undefined;
        this.dryRun = undefined;
        this.data = {};
    }
    if (Object.keys(this.data).length > 0) {
        this.hasData = true;
    } else {
        this.hasData = false;
    }
}

Message.prototype.addData = Message.prototype.addDataWithKeyValue = function (key, value) {
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

/*!
 * node-gcm
 * Copyright(c) 2013 Marcus Farkas <toothlessgear@finitebox.com>
 * MIT Licensed
 */


function Message(raw) {
    if (!(this instanceof Message)) {
        return new Message(raw);
    }

    if (!raw) {
        raw = {};
    }

    this.collapseKey = raw.collapseKey || undefined;
    this.delayWhileIdle = raw.delayWhileIdle || undefined;
    this.timeToLive = raw.timeToLive || undefined;
    this.dryRun = raw.dryRun || undefined;
    this.data = raw.data || {};
    this.notification = raw.notification || {};
}

Message.prototype.addNotification = function() {
    if(arguments.length == 1) {
        var obj = arguments[0];
        if (typeof obj === 'object' && Object.keys(obj).length > 0) {
            this.notification = obj;
        }
        return;
    }
    if(arguments.length == 2) {
        var key = arguments[0], value = arguments[1];
        return this.notification[key] = value;
    }
    throw new Error("Invalid number of arguments given to addNotification ("+arguments.length+")");
};

Message.prototype.addData = function() {
    if(arguments.length == 1) {
        var obj = arguments[0];
        if (typeof obj === 'object' && Object.keys(obj).length > 0) {
            this.data = obj;
        }
        return;
    }
    if(arguments.length == 2) {
        var key = arguments[0], value = arguments[1];
        return this.data[key] = value;
    }
    throw new Error("Invalid number of arguments given to addData ("+arguments.length+")");
};

Message.prototype.addDataWithKeyValue = function (key, value) {
    console.warn("Message#addDataWithKeyValue has been deprecated. Please use Message#addData instead.");
    this.addData(key, value);
};

Message.prototype.addDataWithObject = function (obj) {
    console.warn("Message#addDataWithObject has been deprecated. Please use Message#addData instead.");
    this.addData(obj);
};

module.exports = Message;

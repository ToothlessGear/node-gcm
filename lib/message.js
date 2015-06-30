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
    this.notification = obj.notification || {};
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

var messageOptions = require("./message-options");

function Message(raw) {
    if (!(this instanceof Message)) {
        return new Message(raw);
    }

    if (!raw) {
        raw = {};
    }
    
    this.params = {};

    this.params.collapseKey = raw.collapseKey || undefined;
    this.params.delayWhileIdle = raw.delayWhileIdle || undefined;
    this.params.timeToLive = raw.timeToLive || undefined;
    this.params.dryRun = raw.dryRun || undefined;
    this.params.data = raw.data || {};
    this.params.notification = raw.notification || {};
}

Message.prototype.addNotification = function() {
    if(arguments.length == 1) {
        var obj = arguments[0];
        if (typeof obj === 'object' && Object.keys(obj).length > 0) {
            this.params.notification = obj;
        }
        return;
    }
    if(arguments.length == 2) {
        var key = arguments[0], value = arguments[1];
        return this.params.notification[key] = value;
    }
    throw new Error("Invalid number of arguments given to addNotification ("+arguments.length+")");
};

Message.prototype.addData = function() {
    if(arguments.length == 1) {
        var obj = arguments[0];
        if (typeof obj === 'object' && Object.keys(obj).length > 0) {
            this.params.data = obj;
        }
        return;
    }
    if(arguments.length == 2) {
        var key = arguments[0], value = arguments[1];
        return this.params.data[key] = value;
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

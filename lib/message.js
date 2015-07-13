var messageOptions = require("./message-options");

function Message(raw) {
    if (!(this instanceof Message)) {
        return new Message(raw);
    }

    if (!raw) {
        raw = {};
    }

    var params = {};
    
    Object.keys(raw).forEach(function(param) {
        if(messageOptions[param]) {
            params[param] = raw[param];
        }
    });
    
    this.params = params;
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
        if(!this.params.notification) {
            this.params.notification = {};
        }
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
        if(!this.params.data) {
            this.params.data = {};
        }
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

Message.prototype.toJson = function() {
    var json = {};

    Object.keys(this.params).forEach(function(param) {
        if(messageOptions[param]) {
            var key = param;
            var value = this.params[param];

            var optionDescription = messageOptions[param];
            if(optionDescription.__argName) {
                key = optionDescription.__argName;
            }

            json[key] = value;
        }
    }.bind(this));

    return json;
};

module.exports = Message;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var message_options_1 = __importDefault(require("./message-options"));
var Message = /** @class */ (function () {
    function Message(options) {
        if (!(this instanceof Message)) {
            return new Message();
        }
        this.options = options || {};
    }
    Message.prototype.addNotification = function (objectOrKey, value) {
        return this.handleParamSet(value !== undefined
            ? [objectOrKey, value]
            : [objectOrKey], "notification");
    };
    Message.prototype.addData = function (objectOrKey, value) {
        return this.handleParamSet(value !== undefined
            ? [objectOrKey, value]
            : [objectOrKey], "data");
    };
    Message.prototype.toJson = function () {
        var json = {};
        for (var _i = 0, _a = Object.keys(this.options); _i < _a.length; _i++) {
            var key = _a[_i];
            var optionDescription = message_options_1["default"][key];
            if (!optionDescription) {
                return;
            }
            var jsonKey = optionDescription.__argName || key;
            json[jsonKey] = this.options[key];
        }
        return json;
    };
    /**
     * @deprecated Please use Message#addData instead.
     */
    Message.prototype.addDataWithKeyValue = function (key, value) {
        console.warn("Message#addDataWithKeyValue has been deprecated. Please use Message#addData instead.");
        this.addData(key, value);
    };
    /**
     * @deprecated Please use Message#addData instead.
     */
    Message.prototype.addDataWithObject = function (obj) {
        console.warn("Message#addDataWithObject has been deprecated. Please use Message#addData instead.");
        this.addData(obj);
    };
    Message.prototype.handleParamSet = function (args, paramType) {
        if (args.length == 1) {
            return this.setOption(paramType, args[0]);
        }
        else if (args.length == 2) {
            return this.addOption(paramType, args[0], args[1]);
        }
    };
    Message.prototype.addOption = function (paramType, key, value) {
        if (!this.options[paramType]) {
            this.options[paramType] = {};
        }
        return (this.options[paramType][key] = value);
    };
    Message.prototype.setOption = function (paramType, obj) {
        if (typeof obj === "object" && Object.keys(obj).length > 0) {
            this.options[paramType] = obj;
        }
    };
    return Message;
}());
module.exports = Message;

"use strict";
exports.__esModule = true;
/**
 * @deprecated You are using node-gcm MulticastResult, which is deprecated.
 */
var MulitcastResult = /** @class */ (function () {
    function MulitcastResult() {
        this.success = undefined;
        this.failure = undefined;
        this.canonicalIds = undefined;
        this.multicastId = undefined;
        this.results = [];
        this.retryMulticastIds = [];
        console.warn("You are using node-gcm MulticastResult, which is deprecated.");
    }
    MulitcastResult.prototype.addResult = function (result) {
        this.results.push(result);
    };
    MulitcastResult.prototype.getTotal = function () {
        return this.success + this.failure;
    };
    return MulitcastResult;
}());
exports["default"] = MulitcastResult;

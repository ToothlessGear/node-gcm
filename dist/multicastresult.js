"use strict";
/**
 * @deprecated You are using node-gcm MulticastResult, which is deprecated.
 */
var MulticastResult = /** @class */ (function () {
    function MulticastResult() {
        this.success = undefined;
        this.failure = undefined;
        this.canonicalIds = undefined;
        this.multicastId = undefined;
        this.results = [];
        this.retryMulticastIds = [];
        console.warn('You are using node-gcm MulticastResult, which is deprecated.');
    }
    MulticastResult.prototype.addResult = function (result) {
        this.results.push(result);
    };
    MulticastResult.prototype.getTotal = function () {
        return this.success + this.failure;
    };
    return MulticastResult;
}());
module.exports = MulticastResult;

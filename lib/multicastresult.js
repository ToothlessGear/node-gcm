/*!
 * node-gcm
 * Copyright(c) 2013 Marcus Farkas <toothlessgear@finitebox.com>
 * MIT Licensed
 */

function MulitcastResult() {
    if (!(this instanceof MulitcastResult)) {
        return new MulitcastResult();
    }

    this.success = undefined;
    this.failure = undefined;
    this.canonicalIds = undefined;
    this.multicastId = undefined;
    this.results = [];
    this.retryMulticastIds = [];
}

MulitcastResult.prototype.addResult = function (result) {
    this.results.push(result);
};

MulitcastResult.prototype.getTotal = function () {
    return this.success + this.failure;
};

module.exports = MulitcastResult;

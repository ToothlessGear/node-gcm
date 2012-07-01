/*!
 * node-gcm
 * Copyright(c) 2012 Marcus Farkas <marcus.farkas@spaceteam.at>
 * MIT Licensed
 */

exports = module.exports = MulitcastResult;

function MulitcastResult () {
	this.success;
    this.failure;
  	this.canonicalIds;
  	this.multicastId;
  	this.results = [];
  	this.retryMulticastIds = [];
};

MulitcastResult.prototype.addResult = function(result) {
	this.results.push(result);
};

MulitcastResult.prototype.retryMulticastIds = function(retryMulticastIds) {
	this.retryMulticastIds = retryMulticastIds;
};

MulitcastResult.prototype.__defineGetter__('getMulticastId', function () {
	return this.multicastId;
});

MulitcastResult.prototype.__defineGetter__('getSuccess', function () {
	return this.success;
});

MulitcastResult.prototype.__defineGetter__('getTotal', function () {
	return this.success + this.failure;
});

MulitcastResult.prototype.__defineGetter__('getFailure', function () {
	return this.failure;
});

MulitcastResult.prototype.__defineGetter__('getCanonicalIds', function () {
	return this.canonicalIds;
});

MulitcastResult.prototype.__defineGetter__('getResults', function () {
	return this.results;
});

MulitcastResult.prototype.__defineGetter__('getRetryMulticastIds', function () {
	return this.retryMulticastIds;
});
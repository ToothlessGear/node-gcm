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

MulitcastResult.prototype.getTotal = function () {
	return this.success + this.failure;
};

/*!
 * node-gcm
 * Copyright(c) 2012 Marcus Farkas <marcus.farkas@spaceteam.at>
 * MIT Licensed
 */

exports = module.exports = Result;

function Result () {
	this.messageId;
    this.canonicalRegistrationId;
    this.errorCode;
};

Result.prototype.messageId = function(value) {
	this.messageId = value;
};

Result.prototype.canonicalRegistrationId = function(value) {
	this.canonicalRegistrationId = value;
};

Result.prototype.errorCode = function(value) {
	this.errorCode = value;
};

Result.prototype.__defineGetter__('messageId', function () {
	return this.messageId;
});

Result.prototype.__defineGetter__('canonicalRegistrationId', function () {
	return this.canonicalRegistrationId;
});

Result.prototype.__defineGetter__('errorCode', function () {
	return this.errorCode;
});

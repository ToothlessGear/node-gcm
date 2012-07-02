/*!
 * node-gcm
 * Copyright(c) 2012 Marcus Farkas <marcus.farkas@spaceteam.at>
 * MIT Licensed
 */

exports = module.exports = Result;

function Result () {
	this.messageId = undefined;
    this.canonicalRegistrationId = undefined;
    this.errorCode = undefined;
};

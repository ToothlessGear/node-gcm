/*!
 * node-gcm
 * Copyright(c) 2012 Marcus Farkas <marcus.farkas@spaceteam.at>
 * MIT Licensed
 */

var Constants = require('./constants');
var https = require('https');

exports = module.exports = Sender;

function Sender (key) {
	this.key = key;
};

Sender.prototype.send = function(message, registrationId, retries) {
	// body...
};

Sender.prototype.sendNoRetry = function(message, registrationId) {
	// body...
};

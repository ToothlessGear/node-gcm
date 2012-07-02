/*!
 * node-gcm
 * Copyright(c) 2012 Marcus Farkas <marcus.farkas@spaceteam.at>
 * MIT Licensed
 */

exports = module.exports = Message;

function Message () {
	this.collapseKey = undefined;
    this.delayWhileIdle = undefined;
    this.timeToLive = undefined;
    this.data = {};
};

Message.prototype.addData = function(key, value) {
	this.data[key] = value;
};

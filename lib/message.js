/*!
 * node-gcm
 * Copyright(c) 2012 Marcus Farkas <marcus.farkas@spaceteam.at>
 * MIT Licensed
 */

exports = module.exports = Message;

function Message () {
	this.collapseKey;
    this.delayWhileIdle;
    this.timeToLive;
    this.data;
};

Message.prototype.collapseKey = function(value) {
	this.collapseKey = value;
};

Message.prototype.delayWhileIdle = function(value) {
	this.delayWhileIdle = value;
};

/**
 * Sets the time to live, in seconds.
 */
Message.prototype.timeToLive = function(value) {
	this.timeToLive = value;
};

/**
 * Adds a key/value pair to the payload data.
 */
Message.prototype.addData = function(key, value) {
	this.data[key] = value;
};

Message.prototype.__defineGetter__('collapseKey', function () {
	return this.collapseKey;
});

Message.prototype.__defineGetter__('delayWhileIdle', function () {
	return this.delayWhileIdle;
});

Message.prototype.__defineGetter__('data', function () {
	return this.data;
});

Message.prototype.__defineGetter__('timeToLive', function () {
	return this.timeToLive;
});

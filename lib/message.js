/*!
 * node-gcm
 * Copyright(c) 2012 Marcus Farkas <marcus.farkas@spaceteam.at>
 * MIT Licensed
 */



function Message(obj) {
    this.collapseKey = undefined;
    this.delayWhileIdle = undefined;
    this.timeToLive = undefined;
    this.data = obj || {};
    this.hasData = !!obj;
}

Message.prototype.addData = function (key, value) {
    this.hasData = true;
    this.data[key] = value.toString();
};

module.exports = Message;
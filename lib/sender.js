/*!
 * node-gcm
 * Copyright(c) 2013 Marcus Farkas <toothlessgear@finitebox.com>
 * MIT Licensed
 */
var Constants = require('./constants');
var req = require('request');
var debug = require('debug')('node-gcm');

function Sender(key , options) {
    this.key = key;
    this.options = options;
}

Sender.prototype.sendNoRetry = function(message, registrationIds, callback) {
    var body = {},
        requestBody,
        post_options,
        post_req,
        timeout;

    body[Constants.JSON_REGISTRATION_IDS] = registrationIds;

    if (message.delayWhileIdle !== undefined) {
        body[Constants.PARAM_DELAY_WHILE_IDLE] = message.delayWhileIdle;
    }
    if (message.collapseKey !== undefined) {
        body[Constants.PARAM_COLLAPSE_KEY] = message.collapseKey;
    }
    if (message.timeToLive !== undefined) {
        body[Constants.PARAM_TIME_TO_LIVE] = message.timeToLive;
    }
    if (message.dryRun !== undefined) {
        body[Constants.PARAM_DRY_RUN] = message.dryRun;
    }
    if (message.hasData) {
        body[Constants.PARAM_PAYLOAD_KEY] = message.data;
    }

    requestBody = JSON.stringify(body);

    post_options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-length': Buffer.byteLength(requestBody, 'utf8'),
            'Authorization': 'key=' + this.key
        },
        uri: Constants.GCM_SEND_URI,
        body: requestBody
    };

    if (this.options && this.options.proxy) {
        post_options.proxy = this.options.proxy;
    }

    if (this.options && this.options.maxSockets) {
        post_options.maxSockets = this.options.maxSockets;
    }

    timeout = Constants.SOCKET_TIMEOUT;

    if (this.options && this.options.timeout) {
        timeout =  this.options.timeout;
    }

    post_options.timeout = timeout;

    post_req = req(post_options, function (err, res, resBody) {

        if (err) {
            return callback(err, null);

        }
        if (!res) {
            return callback('response is null', null);

        }
        if (res.statusCode >= 500) {
            debug('GCM service is unavailable');
            return callback(res.statusCode, null);
        } else if (res.statusCode === 401) {
            debug('Unauthorized');
            return callback(res.statusCode, null);
        } else if (res.statusCode !== 200) {
            debug('Invalid request: ' + res.statusCode);
            return callback(res.statusCode, null);
        }

        // Make sure that we don't crash in case something goes wrong while
        // handling the response.
        var data = null;
        try {
            data = JSON.parse(resBody);
        } catch (e) {
            debug("Error handling GCM response " + e);
            return callback("error", null);
        }
        callback(null, data);
    });
};

Sender.prototype.send = function(message, registrationId, retries, callback) {

    var attempt = 0,
        backoff = Constants.BACKOFF_INITIAL_DELAY,
        self = this;

    if (registrationId.length === 1) {

        this.sendNoRetry(message, registrationId, function lambda(err, result) {

            if (!result) {
                if (attempt < retries - 1) {
                    var sleepTime = Math.pow (2, attempt) * backoff;
                    if (sleepTime > Constants.MAX_BACKOFF_DELAY) {
                        sleepTime = Constants.MAX_BACKOFF_DELAY;
                    }
                    setTimeout(function () {
                        self.sendNoRetry(message, registrationId, lambda);
                    }, sleepTime);
                } else {
                    debug('Could not send message after ' + retries + ' attempts');
                    callback(err, result);
                }
                attempt += 1;
            } else {
                callback(err, result);
            }
        });
    } else if (registrationId.length > 1) {
        this.sendNoRetry(message, registrationId, function lambda(err, result) {

            if (attempt < retries - 1) {
                var sleepTime = Math.pow (2, attempt) * backoff,
                    unsentRegIds = [],
                    i;
                if (sleepTime > Constants.MAX_BACKOFF_DELAY) {
                    sleepTime = Constants.MAX_BACKOFF_DELAY;
                }

                //success but check for bad ids
                if (result) {
                    for (i = 0; i < registrationId.length; i += 1) {
                        if (result.results[i].error === 'Unavailable') {
                            unsentRegIds.push(registrationId[i]);
                        }
                    }
                }

                //if we err'd resend them all
                if (err) {
                    unsentRegIds = registrationId;
                }

                registrationId = unsentRegIds;
                if (registrationId.length !== 0) {
                    setTimeout(function () {
                        self.sendNoRetry(message, registrationId, lambda);
                    }, sleepTime);
                    attempt += 1;
                } else {
                    callback(err, result);
                }

            } else {
                debug('Could not send message to all devices after ' + retries + ' attempts');
                callback(err, result);
            }
        });
    } else {
        debug('No RegistrationIds given!');
        callback('No RegistrationIds given!', null);
    }
};

module.exports = Sender;
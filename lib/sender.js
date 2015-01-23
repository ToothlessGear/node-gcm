/*!
 * node-gcm
 * Copyright(c) 2013 Marcus Farkas <toothlessgear@finitebox.com>
 * MIT Licensed
 */
var Constants = require('./constants');
var req = require('request');
var debug = require('debug')('node-gcm');

function Sender(key , options) {
    if (!(this instanceof Sender)) {
        return new Sender(key, options);
    }

    this.key = key;
    this.options = options;
}

Sender.prototype.sendNoRetry = function(message, registrationIds, callback) {
    if(!callback) {
        callback = function() {};
    }

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
    if (Object.keys(message.data)) {
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
            debug('GCM service is unavailable (500)');
            return callback(res.statusCode, null);
        } else if (res.statusCode === 401) {
            debug('Unauthorized (401). Check that your API token is correct.');
            return callback(res.statusCode, null);
        } else if (res.statusCode !== 200) {
            debug('Invalid request (' + res.statusCode + '): ' + resBody);
            return callback(res.statusCode, null);
        }

        try {
            callback(null, JSON.parse(resBody));
        } catch (e) {
            debug("Error handling GCM response " + e);
            callback("error", null);
        }
    });
};

Sender.prototype.send = function(message, registrationId, retries, callback) {
    if(typeof retries == "undefined" || typeof retries == "function") {
        callback = retries;
        retries = 5;
    }
    if(!callback) {
        callback = function() {};
    }

    var attempt = 0,
        backoff = Constants.BACKOFF_INITIAL_DELAY,
        self = this;

    if (registrationId.length) {
        this.sendNoRetry(message, registrationId, function lambda(err, result) {

            if (attempt < retries) {
                var sleepTime, unsentRegIds = [], i;

                // if we err'd resend them all
                if (err) {
                    unsentRegIds = registrationId;
                } 
                // success but check for bad ids
                else {
                    for (i = 0; i < registrationId.length; i += 1) {
                        if (result.results[i].error === 'Unavailable') {
                            unsentRegIds.push(registrationId[i]);
                        }
                    }
                }

                if (unsentRegIds.length) {
                    if (result) {
                        debug("Results received but not all successful", result);
                    }
                    sleepTime = Math.pow (2, attempt) * backoff;
                    if (sleepTime > Constants.MAX_BACKOFF_DELAY) {
                        sleepTime = Constants.MAX_BACKOFF_DELAY;
                    }

                    setTimeout(function () {
                        self.sendNoRetry(message, unsentRegIds, lambda);
                    }, sleepTime);
                    attempt += 1;
                } else {
                    // No more registration ids to send
                    callback(err, result);
                }

            } else {
                // attempts has exceeded retries
                callback(err, result);
            }
        });
    } else {
        debug('No RegistrationIds given!');
        callback('No RegistrationIds given!', null);
    }
};

module.exports = Sender;
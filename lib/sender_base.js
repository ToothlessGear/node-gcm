/*!
 * node-gcm
 * Copyright(c) 2013 Marcus Farkas <toothlessgear@finitebox.com>
 * MIT Licensed
 */
var Constants = require('./constants');
var req = require('request');
var debug = require('debug')('node-gcm');

function SenderBase(key, options) {
    if (!(this instanceof SenderBase)) {
        return new SenderBase(key, options);
    }

    this.key = key;
    this.options = options;

    // added to support child dependency injection
    this.req = this.req ? this.req : require('request');
}

SenderBase.prototype.sendBaseNoRetry = function(message, recipient, callback) {
    if(!callback) {
        callback = function() {};
    }

    var body = {},
        requestBody,
        post_options,
        post_req,
        timeout;

    if (recipient && recipient.registrationIds) {
        // Registration IDs take precedence
        body[Constants.JSON_REGISTRATION_IDS] = recipient.registrationIds;
    } else if (recipient && recipient.notificationKey && recipient.notificationKey.length) {
        body[Constants.PARAM_TO] = recipient.notificationKey;
    } else {
        return callback('No recipients provided', null);
    }

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
    if (message.data && Object.keys(message.data)) {
        if (recipient.notificationKey) {
            message.data[Constants.JSON_NOTIFICATION_KEY] = recipient.notificationKey;
        }
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

    post_req = this.req(post_options, function (err, res, resBody) {

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

SenderBase.prototype.sendBase = function(message, recipient, retries, callback) {
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

    if (recipient && (recipient.notificationKey || 
        (recipient.registrationIds && recipient.registrationIds.length))) {

        this.sendBaseNoRetry(message, recipient, function lambda(err, result) {

            if (attempt < retries) {
                var sleepTime, unsentRegIds = [], i;

                // If registration IDs are provided, retry if an error occurred for the whole request
                // or retry if the request was unsuccessful for a subset of the registration IDs.
                if (recipient.registrationIds && recipient.registrationIds.length) {

                    // if we err'd resend them all
                    if (err) {
                        unsentRegIds = recipient.registrationIds;
                    } 
                    // success but check for bad ids
                    else {
                        for (i = 0; i < recipient.registrationIds.length; i++) {
                            if (result.results[i].error === 'Unavailable') {
                                unsentRegIds.push(recipient.registrationIds[i]);
                            }
                        }
                    }

                    if (unsentRegIds.length) {
                        if (result) {
                            debug("Results received but not all successful", result);
                        }

                        recipient.registrationIds = unsentRegIds;

                        setTimeout(function () {
                            self.sendBaseNoRetry(message, recipient, lambda);
                        }, calculateSleepTime(attempt, backoff));
                        attempt += 1;
                    } else {
                        // No more registration ids to send
                        callback(err, result);
                    }

                } 
                // If a notification_key is provided (and no registration IDs), retry if an error occurred.
                else if (recipient.notificationKey) {

                    var retry = false;

                    if (result && result.success && result.failure && result.failed_registration_ids) {
                        // Google's suggestion is unclear, as there seems no way to "resend" a partially successful
                        // message with a notification_key without sending duplicates to the successful reg IDs. 
                        // The current solution here is to revert back to a registration ID collection and retry.

                        recipient = { registrationIds: result.failed_registration_ids };
                        retry = true;

                    } else if (err) {
                        retry = true;
                    }

                    if (retry) {
                        setTimeout(function () {
                            self.sendBaseNoRetry(message, recipient, lambda);
                        }, calculateSleepTime(attempt, backoff));
                        attempt += 1;
                    } else {
                        callback(err, result);
                    }
                }
                // Recipient is invalid at this point
                else {
                    callback(err, result);
                }

            } else {
                // attempts has exceeded retries
                callback(err, result);
            }
        });
    } else {
        debug('No recipient data provided!');
        callback('No recipient data provided!', null);
    }
};

function calculateSleepTime(attempt, backoff) {
    var sleepTime = Math.pow (2, attempt) * backoff;
    if (sleepTime > Constants.MAX_BACKOFF_DELAY) {
        sleepTime = Constants.MAX_BACKOFF_DELAY;
    }
    return sleepTime;
}

module.exports = SenderBase;
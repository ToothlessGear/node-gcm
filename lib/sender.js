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

    if(typeof registrationIds == "string") {
        registrationIds = [registrationIds];
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

Sender.prototype.send = function(message, registrationIds, options, callback) {
    var backoff, retries;

    if(typeof options == "object") {
        retries = options.retries;
        backoff = options.backoff;

        if(typeof options.retries != "number") {
            retries = 5;
        }
        if(typeof options.backoff != "number") {
            backoff = Constants.BACKOFF_INITIAL_DELAY;
        }
    }
    else if(typeof options == "function") {
        retries = 5;
        backoff = Constants.BACKOFF_INITIAL_DELAY;
        callback = options;
    }
    else if(typeof options == "number") {
        retries = options;
        backoff = Constants.BACKOFF_INITIAL_DELAY;
    }

    if(!callback) {
        callback = function() {};
    }

    if(typeof registrationIds == "string") {
        registrationIds = [registrationIds];
    }
    if (!registrationIds.length) {
        debug('No RegistrationIds given!');
        return process.nextTick(callback.bind(this, 'No RegistrationIds given!', null));
    }

    if(retries == 0) {
        return this.sendNoRetry(message, registrationIds, callback);
    }
    if (backoff > Constants.MAX_BACKOFF_DELAY) {
        backoff = Constants.MAX_BACKOFF_DELAY;
    }

    var self = this;

    this.sendNoRetry(message, registrationIds, function(err, result) {
        // if we err'd resend them all
        if (err) {
            return setTimeout(function() {
                self.send(message, registrationIds, {
                    retries: retries - 1,
                    backoff: backoff * 2
                }, callback);
            }, backoff);
        }

        // check for bad ids
        var unsentRegIds = [], regIdPositionMap = [];
        for (var i = 0; i < registrationIds.length; i++) {
            if (result.results[i].error === 'Unavailable') {
                regIdPositionMap.push(i);
                unsentRegIds.push(registrationIds[i]);
            }
        }

        if (!unsentRegIds.length) {
            return callback(err, result);
        }

        debug("Results received but not all successful", result);

        setTimeout(function () {
            debug("Retrying unsent registration ids");
            self.send(message, unsentRegIds, {
                retries: retries - 1,
                backoff: backoff * 2
            }, function(err, retriedResult) {
                //If the recursive call err'd completely, our current result is the best available
                if(err) {
                    return callback(null, result);
                }

                //Map retried results onto their previous positions in the full array
                var retriedResults = retriedResult.results;
                for(var i = 0; i < result.results.length; i++) {
                    var oldIndex = regIdPositionMap[i];
                    result.results[oldIndex] = retriedResults[i];
                }

                //Update the fields on the result depending on newly returned value
                result.success += retriedResult.success;
                result.canonical_ids += retriedResult.canonical_ids;
                result.failure -= unsentRegIds.length - retriedResult.failure;

                callback(null, result);
            });
        }, backoff);
    });
};

module.exports = Sender;
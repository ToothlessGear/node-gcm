/*!
 * node-gcm
 * Copyright(c) 2013 Marcus Farkas <toothlessgear@finitebox.com>
 * MIT Licensed
 */
var Constants = require('./constants');
var Result = require('./result');

var https = require('https');
var timer = require('timers');
var req = require('request')

function Sender(key , options) {
    this.key = key;
    this.options = options ;
}

var sendNoRetryMethod = Sender.prototype.sendNoRetry = function (message, registrationIds, callback) {
    var body = {},
        result = new Result(),
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

    if(this.options && this.options.proxy){
        post_options.proxy = this.options.proxy;
    }

    timeout = Constants.SOCKET_TIMEOUT;

    if(this.options && this.options.timeout){
        timeout =  this.options.timeout;
    }

    post_options.timeout = timeout;

    post_req = req(post_options, function (err, res, resBody) {

        if (err)
            return callback(err, null);

        if (!res)
            return callback('response is null', null);

        if (res.statusCode >= 500) {
            console.log('GCM service is unavailable');
            return callback(res.statusCode, null);
        } else if(res.statusCode == 401){
            console.log('Unauthorized');
            return callback(res.statusCode, null);
        } else if (res.statusCode !== 200) {
            console.log('Invalid request: ' + res.statusCode);
            return callback(res.statusCode, null);
        }

        // Make sure that we don't crash in case something goes wrong while
        // handling the response.
        try {
            var data = JSON.parse(resBody);
        } catch (e) {
            console.log("Error handling GCM response " + e);
            return callback("error", null);
        }
        callback(null, data);
    });
};

Sender.prototype.send = function (message, registrationId, retries, callback) {

    var attempt = 1,
        backoff = Constants.BACKOFF_INITIAL_DELAY;

    if (registrationId.length === 1) {

        this.sendNoRetry(message, registrationId, function lambda(err, result) {

            if (!result) {
                if (attempt < retries) {
                    var sleepTime = backoff * 2 * attempt;
                    if (sleepTime > Constants.MAX_BACKOFF_DELAY) {
                        sleepTime = Constants.MAX_BACKOFF_DELAY;
                    }
                    timer.setTimeout(function () {
                        sendNoRetryMethod(message, registrationId, lambda);
                    }, sleepTime);
                } else {
                    console.log('Could not send message after ' + retries + ' attempts');
                    callback(err, result);
                }
                attempt += 1;
            } else callback(err, result);
        });
    } else if (registrationId.length > 1) {
        this.sendNoRetry(message, registrationId, function lambda(err, result) {

            if (attempt < retries) {
                var sleepTime = backoff * 2 * attempt,
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
                    unsentRegIds = registrationId
                }

                registrationId = unsentRegIds;
                if (registrationId.length !== 0) {
                    timer.setTimeout(function () {
                        sendNoRetryMethod(message, registrationId, lambda);
                    }, sleepTime);
                    attempt += 1;
                } else callback(err, result);

            } else {
                console.log('Could not send message to all devices after ' + retries + ' attempts');
                callback(err, result);
            }
        });
    } else {
        console.log('No RegistrationIds given!');
        callback('No RegistrationIds given!', null);
    }
};

module.exports = Sender;

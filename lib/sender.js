/*!
 * node-gcm
 * Copyright(c) 2012 Marcus Farkas <marcus.farkas@spaceteam.at>
 * MIT Licensed
 */
var Constants = require('./constants');
var Result = require('./result');

var https = require('https');
var timer = require('timers');


function Sender(key) {
    this.key = key;
}

var sendNoRetryMethod = Sender.prototype.sendNoRetry = function (message, registrationIds, callback) {
    var body = {},
        result = new Result(),
        requestBody,
        post_options,
        post_req;

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
    if (message.hasData) {
        body[Constants.PARAM_PAYLOAD_KEY] = message.data;
    }

    requestBody = JSON.stringify(body);
    post_options = {
        host: Constants.GCM_SEND_ENDPOINT,
        port: '443',
        path: Constants.GCM_SEND_ENDPATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-length': Buffer.byteLength(requestBody, 'utf8'),
            'Authorization': 'key=' + this.key
        }
    };

    post_req = https.request(post_options, function (res) {
        var statusCode = res.statusCode,
            buf = '';
        res.setEncoding('utf-8');
        res.on('data', function (data) {
            buf += data;
        });

        res.on('end', function () {
            if (statusCode === 503) {
                console.log('GCM service is unavailable');
                callback();
            } else if (statusCode !== 200) {
                console.log('Invalid request: ' + statusCode);
                callback();
            }

            // Make sure that we don't crash in case something goes wrong while
            // handling the response.
            try {
                var data = JSON.parse(buf);
                if (registrationIds.length === 1) {
                    if (data.results[0].message_id) {
                        result.messageId = data.results[0].message_id;
                    } else if (data.results[0].error) {
                        result.errorCode = data.results[0].error;
                    } else if (data.results[0].registration_id) {
                        result.canonicalRegistrationId = data.results[0].registration_id;
                    }
                    callback(result);
                } else {
                    callback(data);
                }
            } catch (e) {
                console.log("Error handling GCM response " + e);
                callback();
            }
        });
    });

    post_req.on('error', function (e) {
        console.log("Exception during GCM request: " + e);
        callback();
    });

    post_req.write(requestBody);
    post_req.end();
};

Sender.prototype.send = function (message, registrationId, retries, callback) {

    var attempt = 1,
        backoff = Constants.BACKOFF_INITIAL_DELAY;

    if (registrationId.length === 1) {

        this.sendNoRetry(message, registrationId, function lambda(result) {

            if (result === undefined) {
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
                    callback(result);
                }
                attempt += 1;
            } else {
                callback(result);
            }
        });
    } else if (registrationId.length > 1) {
        this.sendNoRetry(message, registrationId, function lambda(result) {

            if (attempt < retries) {
                var sleepTime = backoff * 2 * attempt,
                    unsentRegIds = [],
                    i;
                if (sleepTime > Constants.MAX_BACKOFF_DELAY) {
                    sleepTime = Constants.MAX_BACKOFF_DELAY;
                }

                for (i = 0; i < registrationId.length; i += 1) {
                    if (result.results[i].error === 'Unavailable') {
                        unsentRegIds.push(registrationId[i]);
                    }
                }

                registrationId = unsentRegIds;
                if (registrationId.length !== 0) {
                    timer.setTimeout(function () {
                        sendNoRetryMethod(message, registrationId, lambda);
                    }, sleepTime);
                    attempt += 1;
                } else {
                    callback(result);
                }
            } else {
                console.log('Could not send message to all devices after ' + retries + ' attempts');
                callback(result);
            }
        });
    } else {
        console.log('No RegistrationIds given!');
    }
};

module.exports = Sender;
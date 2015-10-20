var Constants = require('./constants');
var req = require('request');
var debug = require('debug')('node-gcm');

function Sender(key, options) {
    if (!(this instanceof Sender)) {
        return new Sender(key, options);
    }

    this.key = key;
    this.options = options;
}

var parseAndRespond = function(resBody, callback) {
    var resBodyJSON;

    try {
        resBodyJSON = JSON.parse(resBody);
    } catch (e) {
        debug("Error parsing GCM response " + e);
        callback("Error parsing GCM response");
        return;
    }

    callback(null, resBodyJSON);
};

function extractRecipient(recipient) {
    var validKeys = ['registrationIds', 'registrationTokens', 'topic', 'notificationKey'];
    var theRecipient;

    validKeys.forEach(function(key) {
        if (recipient[key]) {
            theRecipient = recipient[key];
            return;
        }
    });

    return {
        err: theRecipient ?
            null :
            'Invalid recipient key(s) ' + Object.keys(recipient) + ' (valid keys: ' + validKeys.join(', ') + ')',
        recipient: theRecipient
    };
}

Sender.prototype.sendNoRetry = function(message, recipient, callback) {
    if(!callback) {
        callback = function() {};
    }

    var body = message.toJson();

    if(typeof recipient == "string") {
        body.to = recipient;
    }
    else if (!Array.isArray(recipient) && typeof recipient == "object") {
        var o = extractRecipient(recipient);
        var theRecipient;

        if (o.err) {
            return callback(o.err);
        }
        else {
            theRecipient = o.recipient;
        }

        if (Array.isArray(theRecipient)) {
            body.registration_ids = theRecipient;
        }
        else {
            body.to = theRecipient;
        }
    }
    else {
        body.registration_ids = recipient;
    }

    var requestBody = JSON.stringify(body);

    var post_options = {
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

    var timeout = Constants.SOCKET_TIMEOUT;

    if (this.options && this.options.timeout) {
        timeout =  this.options.timeout;
    }

    post_options.timeout = timeout;

    var post_req = req(post_options, function (err, res, resBody) {
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

        parseAndRespond(resBody, callback);
    });
};

Sender.prototype.send = function(message, recipient, options, callback) {
    var backoff, retries;

    // In case of failure, will be passed to send() again for retry
    var originalRecipient = recipient;

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

    if(typeof recipient == "string") {
        recipient = [recipient];
    }
    else if (!Array.isArray(recipient) && typeof recipient == "object") {
        // For topics, passing them to sendNoRetry() as if they were registration tokens
        // will put them in the "to" value of the JSON payload, which what we want
        var o = extractRecipient(recipient);

        if (o.err) {
            return callback(o.err);
        }
        else {
            recipient = o.recipient;
        }
    }

    if (Array.isArray(recipient) && !recipient.length) {
        debug('No recipient provided!');
        return process.nextTick(callback.bind(this, 'No recipient provided!', null));
    }

    if(retries == 0) {
        return this.sendNoRetry(message, recipient, callback);
    }
    if (backoff > Constants.MAX_BACKOFF_DELAY) {
        backoff = Constants.MAX_BACKOFF_DELAY;
    }

    var self = this;

    this.sendNoRetry(message, recipient, function(err, result) {
        // if we err'd resend them all
        if (err) {
            return setTimeout(function() {
                self.send(message, originalRecipient, {
                    retries: retries - 1,
                    backoff: backoff * 2
                }, callback);
            }, backoff);
        }

        // check for bad tokens
        var unsentRegTokens = [], regTokenPositionMap = [];

        // Responses for messages sent a topic just contain { message_id: '...' } or { error: '...' }
        if (result.results) {
            for (var i = 0; i < recipient.length; i++) {
                if (result.results[i].error === 'Unavailable') {
                    regTokenPositionMap.push(i);
                    unsentRegTokens.push(recipient[i]);
                }
            }
        }

        if (!unsentRegTokens.length) {
            return callback(err, result);
        }

        debug("Results received but not all successful", result);

        setTimeout(function () {
            debug("Retrying unsent registration tokens");
            self.send(message, unsentRegTokens, {
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
                    var oldIndex = regTokenPositionMap[i];
                    result.results[oldIndex] = retriedResults[i];
                }

                //Update the fields on the result depending on newly returned value
                result.success += retriedResult.success;
                result.canonical_ids += retriedResult.canonical_ids;
                result.failure -= unsentRegTokens.length - retriedResult.failure;

                callback(null, result);
            });
        }, backoff);
    });
};

module.exports = Sender;

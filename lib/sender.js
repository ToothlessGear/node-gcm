var Constants = require('./constants');
var _ = require('lodash');
var req = require('request');
var debug = require('debug')('node-gcm');

function Sender(key, options) {
    if (!(this instanceof Sender)) {
        return new Sender(key, options);
    }

    this.key = key;
    this.options = options;
}

function extractRecipient(recipient) {
    var recipientKeys = Object.keys(recipient);

    if(recipientKeys.length < 1) {
        return { err: new Error("Please specify a recipient key (empty object provided).") };
    }
    if(recipientKeys.length > 1) {
        return { err: new Error("Please specify only one recipient key at a time.") };
    }

    var key = recipientKeys[0];
    var value  = recipient[key];

    if(!value) {
        return { err: new Error("Falsy value for recipient key '" + key + "'.") };
    }

    var keyValidators = {
        to: isString,
        topic: isString,
        notificationKey: isString,
        registrationIds: isArray,
        registrationTokens: isArray
    };

    var validator = keyValidators[key];
    if(!validator) {
        return { err: new Error("Key '" + key + "' is not a valid recipient key.") };
    }
    if(!validator(value)) {
        return { err: new Error("Recipient key '" + key + "' was provided as an incorrect type.") };
    }

    return {
        err: null,
        recipient: value
    };
}

function isString(x) {
    return typeof x == "string";
}

function isArray(x) {
    return Array.isArray(x);
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
        if (Array.isArray(recipient) && recipient.length == 1) {
            body.to = recipient[0];
        }
        else {
            body.registration_ids = recipient;
        }
    }

    var post_options = {
        method: 'POST',
        headers: {
            'Authorization': 'key=' + this.key
        },
        uri: Constants.GCM_SEND_URI,
        json: body
    };
    
    // Get externally-provided request options passed to gcm.Sender() constructor
    var sender_options = this.options || {};
    
    // Set request options to default to externally-provided options, and override with our own post_options (allow setting new headers)
    var request_options = _.defaultsDeep(post_options, sender_options);
    
    // Allow overriding timeout externally, set to default SOCKET_TIMEOUT if not provided
    if ( ! request_options.timeout ) {
        request_options.timeout = Constants.SOCKET_TIMEOUT;
    }

    var post_req = req(request_options, function (err, res, resBodyJSON) {
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
            debug('Invalid request (' + res.statusCode + '): ' + resBodyJSON);
            return callback(res.statusCode, null);
        }

        callback(null, resBodyJSON);
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

    if (!Array.isArray(recipient) && typeof recipient == "object") {
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

    this.sendNoRetry(message, recipient, function(err, response) {
        // if we err'd resend them all
        if (err) {
            // No retry for 4xx client errors
            if (typeof err === 'number' && err > 399 && err < 500) {
                // Return error to original callback
                return callback(err);
            }
            
            // Retry until we run out of tries
            return setTimeout(function() {
                self.send(message, originalRecipient, {
                    retries: retries - 1,
                    backoff: backoff * 2
                }, callback);
            }, backoff);
        }

        // check for bad tokens
        var unsentRegTokens = [], regTokenPositionMap = [];
        
        // Count recipients (handle string recipients as well)
        var recipientCount = Array.isArray(recipient) ? recipient.length : 1;

        // Responses for messages sent a topic just contain { message_id: '...' } or { error: '...' }
        if (response.results) {
            for (var i = 0; i < recipientCount; i++) {
                if (response.results[i].error === 'Unavailable') {
                    regTokenPositionMap.push(i);
                    unsentRegTokens.push(recipient[i]);
                }
            }
        }

        if (!unsentRegTokens.length) {
            return callback(err, response);
        }

        debug("Response received but not all successful", response);

        setTimeout(function () {
            debug("Retrying unsent registration tokens");
            self.send(message, unsentRegTokens, {
                retries: retries - 1,
                backoff: backoff * 2
            }, function(err, retriedResponse) {
                //If the recursive call err'd completely, our current result is the best available
                if(err) {
                    return callback(null, response);
                }

                //Map retried results onto their previous positions in the full array
                var retriedResults = retriedResponse.results;
                for(var i = 0; i < response.results.length; i++) {
                    var oldIndex = regTokenPositionMap[i];
                    response.results[oldIndex] = retriedResults[i];
                }

                //Update the fields on the result depending on newly returned value
                response.success += retriedResponse.success;
                response.canonical_ids += retriedResponse.canonical_ids;
                response.failure -= unsentRegTokens.length - retriedResponse.failure;

                callback(null, response);
            });
        }, backoff);
    });
};

module.exports = Sender;

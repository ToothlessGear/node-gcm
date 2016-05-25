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

Sender.prototype.send = function(message, recipient, options, callback) {
    if(typeof options == "function") {
        callback = options;
        options = null;
    }
    else if(!callback) {
        callback = function() {};
    }
    options = cleanOptions(options);

    if(options.retries == 0) {
        return this.sendNoRetry(message, recipient, callback);
    }

    var self = this;

    this.sendNoRetry(message, recipient, function(err, response) {
        if (err) {
            if (typeof err === 'number' && err > 399 && err < 500) {
                debug("Error 4xx -- no use retrying. Something is wrong with the request (probably authentication?)");
                return callback(err);
            }

            // Retry until we run out of tries
            return setTimeout(function() {
                self.send(message, recipient, {
                    retries: options.retries - 1,
                    backoff: options.backoff * 2
                }, callback);
            }, options.backoff);
        }

        if(!response.results) {
            return callback(null, response);
        }

        // check for bad tokens
        var unsentRegTokens = [];
        var regTokenPositionMap = [];
        for (var i = 0; i < response.results.length; i++) {
            if (response.results[i].error === 'Unavailable') {
                regTokenPositionMap.push(i);
                unsentRegTokens.push(recipient[i]);
            }
        }

        if (!unsentRegTokens.length) {
            return callback(null, response);
        }

        debug("Response received but not all successful", response);

        setTimeout(function () {
            debug("Retrying " + unsentRegTokens.length + " unsent registration tokens");
            self.send(message, unsentRegTokens, {
                retries: options.retries - 1,
                backoff: options.backoff * 2
            }, function(err, retriedResponse) {
                if(err) {
                    return callback(null, response);
                }
                var response = updateResponse(response, retriedResponse, regTokenPositionMap, unsentRegTokens);
                callback(null, response);
            });
        }, options.backoff);
    });
};

function cleanOptions(options) {
    if(typeof options != "object") {
        var retries = 5;
        if(typeof options == "number") {
            retries = options;
        }
        return {
            retries: retries,
            backoff: Constants.BACKOFF_INITIAL_DELAY
        };
    }

    if(typeof options.retries != "number") {
        options.retries = 5;
    }
    if(typeof options.backoff != "number") {
        options.backoff = Constants.BACKOFF_INITIAL_DELAY;
    }
    if (options.backoff > Constants.MAX_BACKOFF_DELAY) {
        options.backoff = Constants.MAX_BACKOFF_DELAY;
    }

    return options;
}

function updateResponse(response, retriedResponse, regTokenPositionMap, unsentRegTokens) {
    //Map retried results onto their previous positions in the full array
    for(var i = 0; i < response.results.length; i++) {
        var oldIndex = regTokenPositionMap[i];
        response.results[oldIndex] = retriedResponse.results[i];
    }

    //Update the fields on the result depending on newly returned value
    response.success += retriedResponse.success;
    response.canonical_ids += retriedResponse.canonical_ids;
    response.failure -= unsentRegTokens.length - retriedResponse.failure;

    return response;
}

Sender.prototype.sendNoRetry = function(message, recipient, callback) {
    if(!callback) {
        callback = function() {};
    }

    var body = message.toJson();

    if(typeof recipient == "string") {
        body.to = recipient;
    }
    else if(Array.isArray(recipient)) {
        if(!recipient.length) {
            debug('No recipient provided!');
            return process.nextTick(callback.bind(this, 'No recipient provided!', null));
        }
        else if(recipient.length == 1) {
            body.to = recipient[0];
        }
        else {
            body.registration_ids = recipient;
        }
    }
    else if (typeof recipient == "object") {
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
        return process.nextTick(callback.bind(this, 'Invalid recipient (' + recipient + ', type ' + typeof recipient + ') provided!', null));
    }

    //Build request options, allowing some to be overridden
    var request_options = _.defaultsDeep({
        method: 'POST',
        headers: {
            'Authorization': 'key=' + this.key
        },
        uri: Constants.GCM_SEND_URI,
        json: body
    }, this.options || {}, {
        timeout: Constants.SOCKET_TIMEOUT
    });

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

module.exports = Sender;

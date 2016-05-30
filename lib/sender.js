var Constants = require('./constants');
var defaultsDeep = require('lodash.defaultsdeep');
var request = require('request');
var debug = require('debug')('node-gcm');
var messageOptions = require("./message-options");

function Sender(key, options) {
    if (!(this instanceof Sender)) {
        return new Sender(key, options);
    }

    this.key = key;
    this.options = options || {};
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

    this.sendNoRetry(message, recipient, function(err, response, attemptedRegTokens) {
        if (err) {
            if (typeof err === 'number' && err > 399 && err < 500) {
                debug("Error 4xx -- no use retrying. Something is wrong with the request (probably authentication?)");
                return callback(err);
            }
            return retry(self, message, recipient, options, callback);
        }
        if(!response.results) {
            return callback(null, response);
        }
        checkForBadTokens(response.results, attemptedRegTokens, function(err, unsentRegTokens, regTokenPositionMap) {
            if(err) {
                return callback(err);
            }
            if (unsentRegTokens.length == 0) {
                return callback(null, response);
            }

            debug("Retrying " + unsentRegTokens.length + " unsent registration tokens");

            retry(self, message, unsentRegTokens, options, function(err, retriedResponse) {
                if(err) {
                    return callback(null, response);
                }
                response = updateResponse(response, retriedResponse, regTokenPositionMap, unsentRegTokens);
                callback(null, response);
            });
        });
    });
};

function cleanOptions(options) {
    if(!options || typeof options != "object") {
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

function retry(self, message, recipient, options, callback) {
    return setTimeout(function() {
        self.send(message, recipient, {
            retries: options.retries - 1,
            backoff: options.backoff * 2
        }, callback);
    }, options.backoff);
}

function checkForBadTokens(results, originalRecipients, callback) {
    var unsentRegTokens = [];
    var regTokenPositionMap = [];
    for (var i = 0; i < results.length; i++) {
        if (results[i].error === 'Unavailable') {
            regTokenPositionMap.push(i);
            unsentRegTokens.push(originalRecipients[i]);
        }
    }
    nextTick(callback, null, unsentRegTokens, regTokenPositionMap);
}

function updateResponse(response, retriedResponse, regTokenPositionMap, unsentRegTokens) {
    updateResults(response.results, retriedResponse.results, regTokenPositionMap);
    updateResponseMetaData(response, retriedResponse, unsentRegTokens);
    return response;
}

function updateResults(results, retriedResults, regTokenPositionMap) {
    for(var i = 0; i < results.length; i++) {
        results[regTokenPositionMap[i]] = retriedResults[i];
    }
}

function updateResponseMetaData(response, retriedResponse, unsentRegTokens) {
    response.success += retriedResponse.success;
    response.canonical_ids += retriedResponse.canonical_ids;
    response.failure -= unsentRegTokens.length - retriedResponse.failure;
}

Sender.prototype.sendNoRetry = function(message, recipient, callback) {
    if(!callback) {
        callback = function() {};
    }

    getRequestBody(message, recipient, function(err, body) {
        if(err) {
            return callback(err);
        }

        //Build request options, allowing some to be overridden
        var request_options = defaultsDeep({
            method: 'POST',
            headers: {
                'Authorization': 'key=' + this.key
            },
            uri: Constants.GCM_SEND_URI,
            json: body
        }, this.options, {
            timeout: Constants.SOCKET_TIMEOUT
        });

        request(request_options, function (err, res, resBodyJSON) {
            if (err) {
                return callback(err);
            }
            if (res.statusCode >= 500) {
                debug('GCM service is unavailable (500)');
                return callback(res.statusCode);
            }
            if (res.statusCode === 401) {
                debug('Unauthorized (401). Check that your API token is correct.');
                return callback(res.statusCode);
            }
            if (res.statusCode !== 200) {
                debug('Invalid request (' + res.statusCode + '): ' + resBodyJSON);
                return callback(res.statusCode);
            }
            callback(null, resBodyJSON, body.registration_ids || [ body.to ]);
        });
    }.bind(this));
};

function getRequestBody(message, recipient, callback) {
    var body = cleanParams(message);

    if(typeof recipient == "string") {
        body.to = recipient;
        return nextTick(callback, null, body);
    }
    if(Array.isArray(recipient)) {
        if(recipient.length < 1) {
            return nextTick(callback, new Error('Empty recipient array passed!'));
        }
        body.registration_ids = recipient;
        return nextTick(callback, null, body);
    }
    return nextTick(callback, new Error('Invalid recipient (' + recipient + ', type ' + typeof recipient + ') provided (must be array or string)!'));
}

function cleanParams(raw) {
    var params = {};
    Object.keys(raw).forEach(function(param) {
        var paramOptions = messageOptions[param];
        if(!paramOptions) {
            return console.warn("node-gcm ignored unknown message parameter " + param);
        }
        if(paramOptions.__argType != typeof raw[param]) {
            return console.warn("node-gcm ignored wrongly typed message parameter " + param + " (was " + typeof raw[param] + ", expected " + paramOptions.__argType + ")");
        }
        params[param] = raw[param];
    });
    return params;
}

function nextTick(func) {
    var args = Array.prototype.slice.call(arguments, 1);
    process.nextTick(function() {
        func.apply(this, args);
    }.bind(this));
}

module.exports = Sender;

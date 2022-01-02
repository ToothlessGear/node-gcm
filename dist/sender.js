"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var request_1 = __importDefault(require("request"));
var lodash_defaultsdeep_1 = __importDefault(require("lodash.defaultsdeep"));
var constants_1 = __importDefault(require("./constants"));
var debug = require('debug')('node-gcm');
var Sender = /** @class */ (function () {
    function Sender(key, options) {
        if (!(this instanceof Sender)) {
            return new Sender(key, options);
        }
        this.key = key;
        this.options = options || {};
    }
    Sender.prototype.send = function (message, recipient, optionsOrCallback, callback) {
        var _a, _b;
        if (typeof optionsOrCallback == 'function') {
            callback = optionsOrCallback;
            optionsOrCallback = null;
        }
        else if (!callback) {
            callback = function () { };
        }
        var options = cleanOptions(optionsOrCallback);
        if ((_b = (_a = message.options) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.from) {
            console.warn("Sending a notification with the 'from' data attribute may invoke a 400 Bad Request by FCM.");
        }
        if (options.retries == 0) {
            return this.sendNoRetry(message, recipient, callback);
        }
        var self = this;
        this.sendNoRetry(message, recipient, function (err, response, attemptedRegTokens) {
            if (err) {
                // Attempt to determine HTTP status code
                var statusCode = typeof err === 'number' ? err : err.code || 0;
                // 4xx error?
                if (statusCode > 399 && statusCode < 500) {
                    debug('Error 4xx -- no use retrying. Something is wrong with the request (probably authentication?)');
                    return callback(err);
                }
                return retry(self, message, recipient, options, callback);
            }
            if (!response.results) {
                return callback(null, response);
            }
            checkForBadTokens(response.results, attemptedRegTokens, function (err, unsentRegTokens, regTokenPositionMap) {
                if (err) {
                    return callback(err);
                }
                if (unsentRegTokens.length == 0) {
                    return callback(null, response);
                }
                debug('Retrying ' + unsentRegTokens.length + ' unsent registration tokens');
                retry(self, message, unsentRegTokens, options, function (err, retriedResponse) {
                    if (err) {
                        return callback(null, response);
                    }
                    response = updateResponse(response, retriedResponse, regTokenPositionMap, unsentRegTokens);
                    callback(null, response);
                });
            });
        });
    };
    Sender.prototype.sendNoRetry = function (message, recipient, callback) {
        var _this = this;
        if (!callback) {
            callback = function () { };
        }
        getRequestBody(message, recipient, function (err, body) {
            if (err) {
                return callback(err);
            }
            //Build request options, allowing some to be overridden
            var request_options = (0, lodash_defaultsdeep_1["default"])({
                method: 'POST',
                headers: {
                    Authorization: 'key=' + _this.key
                },
                json: body
            }, _this.options, {
                uri: constants_1["default"].GCM_SEND_URI,
                timeout: constants_1["default"].SOCKET_TIMEOUT
            });
            (0, request_1["default"])(request_options, function (err, res, resBodyJSON) {
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
                if (!resBodyJSON) {
                    debug('Empty response received (' + res.statusCode + ' ' + res.statusMessage + ')');
                    // Spoof error code 400 to avoid retrying the request
                    return callback({ error: res.statusMessage, code: 400 });
                }
                callback(null, resBodyJSON, body.registration_ids || [body.to]);
            });
        });
    };
    return Sender;
}());
function cleanOptions(options) {
    if (!options || typeof options != 'object') {
        var retries = 5;
        if (typeof options == 'number') {
            retries = options;
        }
        return {
            retries: retries,
            backoff: constants_1["default"].BACKOFF_INITIAL_DELAY
        };
    }
    if (typeof options.retries != 'number') {
        options.retries = 5;
    }
    if (typeof options.backoff != 'number') {
        options.backoff = constants_1["default"].BACKOFF_INITIAL_DELAY;
    }
    if (options.backoff > constants_1["default"].MAX_BACKOFF_DELAY) {
        options.backoff = constants_1["default"].MAX_BACKOFF_DELAY;
    }
    return options;
}
function retry(self, message, recipient, options, callback) {
    return setTimeout(function () {
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
        if (results[i].error === 'Unavailable' || results[i].error === 'InternalServerError') {
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
    for (var i = 0; i < results.length; i++) {
        results[regTokenPositionMap[i]] = retriedResults[i];
    }
}
function updateResponseMetaData(response, retriedResponse, unsentRegTokens) {
    response.success += retriedResponse.success;
    response.canonical_ids += retriedResponse.canonical_ids;
    response.failure -= unsentRegTokens.length - retriedResponse.failure;
}
function getRequestBody(message, recipientOrCallback, callback) {
    var body = message.toJson();
    if (typeof recipientOrCallback == 'string') {
        body.to = recipientOrCallback;
        return nextTick(callback, null, body);
    }
    if (Array.isArray(recipientOrCallback)) {
        if (!recipientOrCallback.length) {
            return nextTick(callback, 'No recipient provided!');
        }
        else if (recipientOrCallback.length == 1) {
            body.to = recipientOrCallback[0];
            return nextTick(callback, null, body);
        }
        body.registration_ids = recipientOrCallback;
        return nextTick(callback, null, body);
    }
    if (typeof recipientOrCallback == 'object') {
        return extractRecipient(recipientOrCallback, function (err, recipient, param) {
            if (err) {
                return callback(err);
            }
            body[param] = recipient;
            return callback(null, body);
        });
    }
    return nextTick(callback, 'Invalid recipient (' + recipientOrCallback + ', type ' + typeof recipientOrCallback + ') provided!');
}
function nextTick(func) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    process.nextTick(function () {
        func.apply(this, args);
    }.bind(this));
}
function extractRecipient(recipient, callback) {
    var recipientKeys = Object.keys(recipient);
    if (recipientKeys.length !== 1) {
        return nextTick(callback, new Error('Please specify exactly one recipient key (you specified [' + recipientKeys + '])'));
    }
    var key = recipientKeys[0];
    var value = recipient[key];
    if (!value) {
        return nextTick(callback, new Error("Falsy value for recipient key '" + key + "'."));
    }
    var keyValidators = {
        to: isString,
        topic: isString,
        condition: isString,
        notificationKey: isString,
        registrationIds: isArray,
        registrationTokens: isArray
    };
    var validator = keyValidators[key];
    if (!validator) {
        return nextTick(callback, new Error("Key '" + key + "' is not a valid recipient key."));
    }
    if (!validator(value)) {
        return nextTick(callback, new Error("Recipient key '" + key + "' was provided as an incorrect type."));
    }
    var param = getParamFromKey(key);
    return nextTick(callback, null, value, param);
}
function getParamFromKey(key) {
    if (key === 'condition') {
        return 'condition';
    }
    else if (['registrationIds', 'registrationTokens'].indexOf(key) !== -1) {
        return 'registration_ids';
    }
    else {
        return 'to';
    }
}
function isString(x) {
    return typeof x == 'string';
}
function isArray(x) {
    return Array.isArray(x);
}
module.exports = Sender;

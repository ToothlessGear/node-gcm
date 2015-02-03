var Constants = require('./constants');
var req = require('request');
var debug = require('debug')('node-gcm');
var NotificationKeyOperation = require('./notification_key_operation');

function NotificationKeyOperator(projectNumber, key, options) {
    if (!(this instanceof NotificationKeyOperator)) {
        return new NotificationKeyOperator(projectNumber, key, options);
    }

    this.projectNumber = projectNumber;
    this.key = key;
    this.options = options;
}

NotificationKeyOperator.prototype.performOperationNoRetry = function(op, callback) {

    if(!callback) {
        callback = function() {};
    }

    if (!NotificationKeyOperation.isValidOperation(op, function(err) {
        if (err) {
            debug('Notification Key Operation Error: ' + err);
            callback('error', null);
            return false;
        }
        return true;
    })) return;

    var body = {},
        requestBody,
        post_options,
        post_req,
        timeout;

    if (op.operationType !== undefined) {
        body[Constants.PARAM_OPERATION] = op.operationType;
    }
    if (op.notificationKeyName !== undefined) {
        body[Constants.PARAM_NOTIFICATION_KEY_NAME] = op.notificationKeyName;
    }
    if (op.notificationKey !== undefined) {
        body[Constants.PARAM_NOTIFICATION_KEY] = op.notificationKey;
    }
    if (op.registrationIds !== undefined) {
        body[Constants.JSON_REGISTRATION_IDS] = op.registrationIds;
    }

    requestBody = JSON.stringify(body);

    post_options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-length': Buffer.byteLength(requestBody, 'utf8'),
            'project_id': this.projectNumber,
            'Authorization': 'key=' + this.key
        },
        uri: Constants.GCM_NOTIFICATION_URI,
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

NotificationKeyOperator.prototype.performOperation = function(op, retries, callback) {
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

    this.performOperationNoRetry(op, function lambda(err, result) {
        if (attempt < retries) {
            var sleepTime, i;

            if (err >= 500) {

                debug('Unsuccessful notifiation key operation request. Retrying: ' + attempt)

                sleepTime = Math.pow (2, attempt) * backoff;
                if (sleepTime > Constants.MAX_BACKOFF_DELAY) {
                    sleepTime = Constants.MAX_BACKOFF_DELAY;
                }

                setTimeout(function () {
                    self.performOperationNoRetry(op, lambda);
                }, sleepTime);

                attempt += 1;

            } else {
                // retries complete
                callback(err, result);
            }

        } else {
            // attempts has exceeded retries
            callback(err, result);
        }
    });
};


module.exports = NotificationKeyOperator;


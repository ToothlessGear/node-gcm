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
            callback('Notification Key Operation Error: ' + err, null);
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
            debug('GCM service is unavailable (500): ' + resBody);
            return callback(res.statusCode, null);
        } else if (res.statusCode === 401) {
            debug('Unauthorized (401). Check that your API token is correct.');
            return callback(res.statusCode, null);
        } else if (res.statusCode === 400) {
            debug('Invalid request (' + res.statusCode + '): ' + resBody);    
            return callback(res.statusCode, JSON.parse(resBody));
        } else if (res.statusCode !== 200) {
            debug('Invalid request (' + res.statusCode + '): ' + resBody);
            return callback(res.statusCode, null);
        }

        try {
            callback(null, JSON.parse(resBody));
        } catch (e) {
            debug("Error handling GCM response " + e);
            callback("Error handling GCM response: " + e, null);
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

NotificationKeyOperator.prototype.requestUpdatedKey = function(opts, callback) {

    /**
    * opts: { keyName (string), key (optional string), 
    *         registrationIds (string array), isRemoval (boolean) }
    **/

    if (!opts) return callback('Missing options parameter');

    if (!opts.keyName) return callback('Invalid or missing option: keyName');
    if (!opts.registrationIds || !opts.registrationIds.length) {
        return callback('Invalid or missing option: registrationIds');
    }

    var operation = new NotificationKeyOperation();

    if (opts.key && opts.key.length && !opts.isRemoval) operation.operationType = 'add';
    else if (!opts.isRemoval) operation.operationType = 'create';
    else operation.operationType = 'remove';

    debug('Performing GCM notification key operation: ' + operation.operationType);

    operation.notificationKey = opts.key;
    operation.notificationKeyName = opts.keyName.toString();
    operation.registrationIds = opts.registrationIds;

    var operator = this;
    operator.performOperation(operation, handleOpResult = function(err, result) {
        
        debug('Performed GCM operation: ' + operation.operationType);

        if (err === 400 && result && result.error) {
            // This is a poor way of handling specific 400 errors, but it's the only way we're given

            debug('Received 400 error. Checking for possible next steps: ' + result.error);

            if (operation.operationType === 'create' && operation.key && result.error === 'notification_key already exists') {
                // The notification key has already been created for this key name. Try an 'add' operation.
                debug('Switching from a create to add operation');
                operation.operationType = 'add';
                return operator.performOperation(operation, handleOpResult);
            } else if (operation.operationType === 'add' && result.error === 'notification_key not found') {
                // The notification key no longer exists (which happens when you remove all reg IDs). 
                // Try a 'create' operation.
                debug('Switching from an add to a create operation');
                operation.key = null;
                operation.operationType = 'create';
                return operator.performOperation(operation, handleOpResult);
            }
        }

        if (!result && err) {
            debug('GCM notification key operation error: ' + err);
            return callback(err);
        }

        if (result.notification_key) {
            debug('Received notification key: ' + result.notification_key);
        }

        callback(null, result);
    });
}


module.exports = NotificationKeyOperator;


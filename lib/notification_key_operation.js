function NotificationKeyOperation(obj) {
    if (!(this instanceof NotificationKeyOperation)) {
        return new NotificationKeyOperation(obj);
    }

    if (!obj) {
        obj = {};
    }

    this.operationType = obj.operationType || undefined;
    this.notificationKeyName = obj.notificationKeyName || undefined;
    this.notificationKey = obj.notificationKey || undefined;
    this.registrationIds = obj.registrationIds || [];
}

NotificationKeyOperation.operationTypes = [
    'create',
    'add',
    'remove'
];

NotificationKeyOperation.isValidOperation = function(op, callback) {
    if (!op.operationType || NotificationKeyOperation.operationTypes.indexOf(op.operationType) == -1) {
        return callback('Missing or invalid operation type');
    }
    if (!op.notificationKeyName || !op.notificationKeyName.length) {
        return callback('Missing or invalid notification key name');
    } 
    if (op.notificationKeyName !== 'create' && (!op.notificationKey || !op.notificationKey.length)) {
        return callback('Missing or invalid notification key');
    }
    if (!op.registrationIds || !op.registrationIds.length) {
        return callback('Missing registration IDs');
    }

    return callback();
};


module.exports = NotificationKeyOperation;
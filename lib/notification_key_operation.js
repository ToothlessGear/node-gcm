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
    this.recreateKeyIfMissing = obj.recreateKeyIfMissing || false;
}

NotificationKeyOperation.operationTypes = [
    'create',
    'add',
    'remove'
];

NotificationKeyOperation.isValidOperation = function(op, callback) {
    if (!op.operationType || NotificationKeyOperation.operationTypes.indexOf(op.operationType) == -1) {
        callback('Missing or invalid operation type');
        return false;
    }
    if (!op.notificationKeyName || !op.notificationKeyName.length) {
        callback('Missing or invalid notification key name');
        return false;
    } 
    if (op.operationType !== 'create' && (!op.notificationKey || !op.notificationKey.length)) {
        callback('Missing or invalid notification key');
        return false;
    }
    if (!op.registrationIds || !op.registrationIds.length) {
        callback('Missing registration IDs');
        return false;
    }

    return true;
};


module.exports = NotificationKeyOperation;
function Operation(obj) {

    if (!(this instanceof Operation)) {
        return new Operation(obj);
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

Operation.operationTypes = [
    'create',
    'add',
    'remove'
];

Operation.isValidOperation = function(op, callback) {
    if (!op.operationType || Operation.operationTypes.indexOf(op.operationType) == -1) {
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


module.exports = Operation;
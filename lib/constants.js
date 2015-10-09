/*!
 * node-gcm
 * Copyright(c) 2013 Marcus Farkas <toothlessgear@finitebox.com>
 * MIT Licensed
 */

var Constants = {

    'GCM_SEND_ENDPOINT' : 'gcm-http.googleapis.com',

    'GCM_SEND_ENDPATH' : '/gcm/send',

    'GCM_SEND_URI' : 'https://gcm-http.googleapis.com:443/gcm/send',

    'ERROR_QUOTA_EXCEEDED' : 'QuotaExceeded',

    'ERROR_DEVICE_QUOTA_EXCEEDED' : 'DeviceQuotaExceeded',

    'ERROR_MISSING_REGISTRATION' : 'MissingRegistration',

    'ERROR_INVALID_REGISTRATION' : 'InvalidRegistration',

    'ERROR_MISMATCH_SENDER_ID' : 'MismatchSenderId',

    'ERROR_NOT_REGISTERED' : 'NotRegistered',

    'ERROR_MESSAGE_TOO_BIG' : 'MessageTooBig',

    'ERROR_MISSING_COLLAPSE_KEY' : 'MissingCollapseKey',

    'ERROR_UNAVAILABLE' : 'Unavailable',

    'TOKEN_MESSAGE_ID' : 'id',

    'TOKEN_CANONICAL_REG_ID' : 'registration_id',

    'TOKEN_ERROR' : 'Error',

    'JSON_REGISTRATION_IDS' : 'registration_ids',

    'JSON_PAYLOAD' : 'data',

    'JSON_NOTIFICATION' : 'notification',

    'JSON_SUCCESS' : 'success',

    'JSON_FAILURE' : 'failure',

    'JSON_CANONICAL_IDS' : 'canonical_ids',

    'JSON_MULTICAST_ID' : 'multicast_id',

    'JSON_RESULTS' : 'results',

    'JSON_ERROR' : 'error',

    'JSON_MESSAGE_ID' : 'message_id',

    'UTF8' : 'UTF-8',

    'BACKOFF_INITIAL_DELAY' : 1000,

    'MAX_BACKOFF_DELAY' : 1024000  ,

    'SOCKET_TIMEOUT' : 180000 //three minutes
};

module.exports = Constants;

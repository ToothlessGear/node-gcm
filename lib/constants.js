var Constants = {
    'GCM_SEND_ENDPOINT' : 'fcm.googleapis.com',
    'GCM_SEND_ENDPATH' : '/fcm/send',
    'GCM_SEND_URI' : 'https://fcm.googleapis.com/fcm/send',
    'BACKOFF_INITIAL_DELAY' : 1000,
    'MAX_BACKOFF_DELAY' : 1024000  ,
    'SOCKET_TIMEOUT' : 180000, //three minutes

    /** DEPRECATED **/

    //These errors could probably be structured more nicely, and could be used in the code.
    // -- maybe just as an Error abstraction?
    'ERROR_QUOTA_EXCEEDED' : 'QuotaExceeded',
    'ERROR_DEVICE_QUOTA_EXCEEDED' : 'DeviceQuotaExceeded',
    'ERROR_MISSING_REGISTRATION' : 'MissingRegistration',
    'ERROR_INVALID_REGISTRATION' : 'InvalidRegistration',
    'ERROR_MISMATCH_SENDER_ID' : 'MismatchSenderId',
    'ERROR_NOT_REGISTERED' : 'NotRegistered',
    'ERROR_MESSAGE_TOO_BIG' : 'MessageTooBig',
    'ERROR_MISSING_COLLAPSE_KEY' : 'MissingCollapseKey',
    'ERROR_UNAVAILABLE' : 'Unavailable'

    /** END DEPRECATED **/
};

module.exports = Constants;

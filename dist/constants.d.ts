declare const Constants: {
    GCM_SEND_ENDPOINT: string;
    GCM_SEND_ENDPATH: string;
    GCM_SEND_URI: string;
    BACKOFF_INITIAL_DELAY: number;
    MAX_BACKOFF_DELAY: number;
    SOCKET_TIMEOUT: number;
    /** DEPRECATED **/
    /** @deprecated */
    TOKEN_MESSAGE_ID: string;
    TOKEN_CANONICAL_REG_ID: string;
    TOKEN_ERROR: string;
    JSON_REGISTRATION_IDS: string;
    JSON_PAYLOAD: string;
    JSON_NOTIFICATION: string;
    JSON_SUCCESS: string;
    JSON_FAILURE: string;
    JSON_CANONICAL_IDS: string;
    JSON_MULTICAST_ID: string;
    JSON_RESULTS: string;
    JSON_ERROR: string;
    JSON_MESSAGE_ID: string;
    UTF8: string;
    ERROR_QUOTA_EXCEEDED: string;
    ERROR_DEVICE_QUOTA_EXCEEDED: string;
    ERROR_MISSING_REGISTRATION: string;
    ERROR_INVALID_REGISTRATION: string;
    ERROR_MISMATCH_SENDER_ID: string;
    ERROR_NOT_REGISTERED: string;
    ERROR_MESSAGE_TOO_BIG: string;
    ERROR_MISSING_COLLAPSE_KEY: string;
    ERROR_UNAVAILABLE: string;
    ERROR_INTERNAL_SERVER_ERROR: string;
};
export = Constants;

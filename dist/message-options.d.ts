/**
 * This module defines all the arguments that may be passed to a message.
 *
 * Each argument may contain a field `__argName`, if the name of the field
 * should be different when sent to the server.
 *
 * The argument may also contain a field `__argType`, if the given
 * argument must be of that type. The types are the strings resulting from
 * calling `typeof <arg>` where `<arg>` is the argument.
 *
 * Other than that, the arguments are expected to follow the indicated
 * structure.
 */
declare const MessageOptions: {
    collapseKey: {
        __argName: string;
        __argType: string;
    };
    priority: {
        __argType: string;
    };
    contentAvailable: {
        __argName: string;
        __argType: string;
    };
    mutableContent: {
        __argName: string;
        __argType: string;
    };
    delayWhileIdle: {
        __argName: string;
        __argType: string;
    };
    timeToLive: {
        __argName: string;
        __argType: string;
    };
    restrictedPackageName: {
        __argName: string;
        __argType: string;
    };
    dryRun: {
        __argName: string;
        __argType: string;
    };
    data: {
        __argType: string;
    };
    notification: {
        __argType: string;
    };
    fcm_options: {
        __argType: string;
    };
};
export = MessageOptions;

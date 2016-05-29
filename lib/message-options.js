/**
 * This module defines all the arguments that may be passed to a message.
 *
 * Each argument may contain a field `__argType`, in which case the given
 * argument must be of that type. The types are the strings resulting from
 * calling `typeof <arg>` where `<arg>` is the argument.
 */

module.exports = {
	collapse_key: {
        __argType: "string"
    },
    priority: {
        __argType: "string"
    },
    content_available: {
        __argType: "boolean"
    },
	delay_while_idle: {
        __argType: "boolean"
    },
    time_to_live: {
        __argType: "number"
    },
    restricted_package_name: {
        __argType: "string"
    },
    dry_run: {
        __argType: "boolean"
    },
    data: {
        __argType: "object"
    },
    notification: {
        __argType: "object"
        //TODO: There are a lot of very specific arguments that could
        //      be indicated here.
    }
};

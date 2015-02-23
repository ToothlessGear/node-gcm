# Message

    var gcm = require("gcm");

A message contains the data that is sent to the Android device.
It is constructed with an options object, which can contain any of the given keys.
All of the keys are optional.
If no object is passed, it is the same as passing no keys.

See the [GCM server reference](https://developer.android.com/google/gcm/server-ref.html#table1) for details on some of the options.

 - `collapseKey` identifies a group of messages that can be collapsed.
   If you send several notifications with the same notification key to a device that is offline, it will only show the most recent when it comes back online.
 - When `delayWhileIdle` is set to `true`, it indicates that the message shuold not be sent until the device becomes active.
 - `time_to_live` specifies how long (in seconds) the message should be kept in GCM storage if the device is offline.
   The maximum time to live supported is 4 weeks (which is also the default).
 - `dry_run` indicates whether or not this is a test request.
   If it is set to `true` the server responds as it would, but the message is not actually sent.
 - `data` contains the JSON payload received by the app.

    /* No keys set */
    var msg = new gcm.Message();

    /* All keys set */
    var msg = new gcm.Message({
      collapseKey: "new_message",
      delayWhileIdle: true,
      timeToLive: 5 * 60 * 60 * 24, // 5 days
      dryRun: true,
      data: {
        displayString: "Hello, world."
      }
    });

The options have to be set on creation, but the payload of the message can be modified later.
There are two ways to add data.
Either key-value, where the key is added (or overwritten) with the given value; or a full-object override.
If you set a whole object, it will replace the current payload.

    /* Key-value adding of data */
    msg.addData("numberOfBunniesToDisplay", 13);

    /* Object-override of data */
    msg.addData({
      displayString: "Goodbye, world.",
      numberOfBunniesToDisplay: 2
    });

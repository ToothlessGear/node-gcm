# Sender

    var gcm = require("gcm");

To send [a message](message.js.html), you need a connection to the GCM service.
This is established using your API key.

    var sender = new gcm.Sender("your-api-key");

You can manually define the max number of sockets to have open at one time.

    var sender = new gcm.Sender("your-api-key", {
      maxSockets: 12
    });

If you want to use a proxy, you can do that, too.
This is [just like passing a proxy on to request](https://github.com/request/request#proxies).

    var sender = new gcm.Sender("your-api-key", {
      proxy: "http://your-proxy.com"
    });

## Sending off a message

    ...

Now that you have your sender set up, it's time to send off [a message](message.js.html).
First, you need to get the Registration IDs of your recipients.
You [create Registration IDs in the app](https://developer.android.com/google/gcm/gs.html), and this won't be covered here.

    /* Magically found Registration IDs */
    var registrationIds = [
      "1",
      "2",
      "3"
    ];

The sending of a message can be done in a variety of ways, but the simplest takes only what you have now.

    sender.send(msg, registrationIds, function(error, result) {
      if(error) {
        /* Something went wrong */
      }
      else {
        /* The request was sent off */
      }
    });

#### Errors and Results

    ...

If the sender returns an `error`, something went wrong in the communication with the server.
This means that the message was sent to *none* of the recipients.
If an invalid response code was received from the server (for example, `401`), this will be the value of `error`.

    if(error == 401) {
      /* Request was unauthorized (most likely wrong API key) */
    }
    if(error == 400) {
      /* Something was wrong with the request (most likely the message was invalid) */
    }
    if(error == 500) {
      /* Something went wrong on the server */
    }
    /* ... */

The `result` is returned if no `error` was.
In this case, the message was sent to between 0 and all of the recipients.
**Note that the presence of a `result` does not mean that any messages were sent.**

A `result` [contains four fields](https://developer.android.com/google/gcm/http.html#response):

- `success`, the number of recipients who were sent the message.
- `failure`, the number of recipients who the message could not be sent to.
- `canonical_ids`, the number of recipients who have changed their Registration ID.
  The message was still sent to them, but your local version of their Registration ID should be updated.
- `results`, an array of results for each individual recipient.
  The array is ordered in the same way the `registrationIds` were.

    if(result.success == registrationIds.length) {
      /* All the messages succeeded */
    }

    if(result.failure > 0) {
      /* One or more messages failed */
    }

    if(result.failure == registrationIds.length) {
      /* All the messages failed */
    }

    if(result.canonical_ids > 0) {
      /* One or more of the recipients have new Registration IDs */
    }

Each of the `results` may contain one of the following values:

- `message_id`, if the message was sent succesfully.
- `registration_id`, if the recipient's Registration ID has changed.
  The field will contain the new Registration ID, which should replace the old one in your local storage.
  All future messages for this recipient should use the new ID.
- `error`, if something went wrong, sending to that specific recipient.
  If it is `"Unavailable"`, this means the GCM servers were busy and could not process the message for this particular recipient, and the message should be retried.
  The GCM API documentation has a [list of possible error codes](https://developer.android.com/google/gcm/http.html#error_codes).

    result.results.forEach(function(r, index) {
      var registrationId = registrationIds[index];

      if(r.canonical_id) {
        /* A new ID was found! Update our local version... */
        myLocalStorage.update(registrationId, r.canonical_id);
      }

      if(r.error) {
        console.error("Failed to send message to "+registrationId, r.error);
      }

      if(r.message_id) {
        console.log("Succesfully sent message "+r.message_id+" to "+registrationId);
      }

    });

#### Retries and Backoff

    ...

The `send` method is intelligent:
per default, it retries a request 5 times with exponential backoff (starting at 1000 ms).
These values can be customized through an optional `options` object.

    var options = {
      retries: 7,
      backoff: 100
    };

    sender.send(msg, registrationIds, options, callback);

If you only want to set a number of retries, you can just pass that instead of the `options` argument.

    sender.send(msg, registrationIds, 7, callback);

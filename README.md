# node-gcm

[![Join the chat at https://gitter.im/ToothlessGear/node-gcm](https://badges.gitter.im/ToothlessGear/node-gcm.svg)](https://gitter.im/ToothlessGear/node-gcm?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm](https://badge.fury.io/js/node-gcm.svg)](https://www.npmjs.com/package/node-gcm)

The goal of this project is providing the best and most easily used interface for Google's Cloud Messaging service (now called Firebase Cloud Messaging, FCM).
We appreciate all the help we can get!
If you want to help out, check out the [Guidelines for Contributing](CONTRIBUTING.md) section.

If you are developing an open-source project with a broader scope (like a full Firebase suite), we would love for you to use node-gcm internally.

See the [official FCM documentation](https://firebase.google.com/docs/cloud-messaging/) for more information.

This is the README for the `v1` branch, and it is currently work in progress.
Version 1.0.0 is only available in an alpha version.
Follow [PR #238](https://github.com/ToothlessGear/node-gcm/pull/238) to see current status.
We currently recommend you use the mainline version of node-gcm (found on the master branch) for production.

## Installation

```bash
$ npm install node-gcm
```

## Requirements

This library provides the server-side implementation of GCM.
You need to generate an [API Key](https://developers.google.com/cloud-messaging/gcm#apikey).

GCM notifications can be sent to both [Android](https://developers.google.com/cloud-messaging/android/start) and [iOS](https://developers.google.com/cloud-messaging/ios/start).
If you are new to GCM you should probably look into the [documentation](https://developers.google.com/cloud-messaging/gcm).

## Example application

According to below **Usage** reference, we could create such application:

```js
var gcm = require('node-gcm')('YOUR_API_KEY_HERE');

var message = {
    data: { key1: 'msg1' }
};
var recipient = 'YOUR_REG_TOKEN_HERE';

gcm.send(message, recipient, function (err, response) {
	if(err) console.error(err);
	else 	console.log(response);
});
```

## Usage

```js
var gcm = require('node-gcm')('insert Google Server API Key here');

// Create a message (all possible values shown)
var message = {
	collapse_key: 'demo',
	priority: 'high',
	content_available: true,
	delay_while_idle: true,
	time_to_live: 3,
	restricted_package_name: "somePackageName",
	dry_run: true,
	data: {
		key1: 'message1',
		key2: 'message2'
	},
	notification: {
		title: "Hello, World",
		icon: "ic_launcher",
		body: "This is a notification that will be displayed ASAP."
	}
};

// Add the registration tokens of the devices you want to send to
var registrationTokens = [];
registrationTokens.push('regToken1');
registrationTokens.push('regToken2');

// Send the message
// ... trying only once
gcm.send(message, registrationTokens, { retries: 0 }, function(err, response) {
  if(err) console.error(err);
  else    console.log(response);
});

// ... or retrying
gcm.send(message, registrationTokens, function (err, response) {
  if(err) console.error(err);
  else    console.log(response);
});

// ... or retrying a specific number of times (10)
gcm.send(message, registrationTokens, 10, function (err, response) {
  if(err) console.error(err);
  else    console.log(response);
});
```

## Recipients

You can send a push notification to various recipient or topic, by providing a notification key, registration token or topic as a string.
Alternatively, you can send it to several recipients at once, by providing an array of registration tokens.

Notice that [you can *at most* send notifications to 1000 registration tokens at a time](https://github.com/ToothlessGear/node-gcm/issues/42).
This is due to [a restriction](http://developer.android.com/training/cloudsync/gcm.html) on the side of the GCM API.

## Notification usage

```js
var message = {
    notification: {
        title: 'Alert!!!',
        body: 'Abnormal data access',
        icon: 'ic_launcher'
    }
};
```

### Notification payload option table

|Parameter|Platform|Usage|Description|
|---|---|---|---|
|title|Android, iOS (Watch)|Required (Android), Optional (iOS), string|Indicates notification title. This field is not visible on iOS phones and tablets.|
|body|Android, iOS|Optional, string|Indicates notification body text.|
|icon|Android|Required, string|Indicates notification icon. On Android: sets value to myicon for drawable resource myicon.png.|
|sound|Android, iOS|Optional, string|Indicates sound to be played. Supports only default currently.|
|badge|iOS|Optional, string|Indicates the badge on client app home icon.|
|tag|Android|Optional, string|Indicates whether each notification message results in a new entry on the notification center on Android. If not set, each request creates a new notification. If set, and a notification with the same tag is already being shown, the new notification replaces the existing one in notification center.|
|color|Android|Optional, string|Indicates color of the icon, expressed in #rrggbb format|
|click_action|Android, iOS|Optional, string|The action associated with a user click on the notification. On Android, if this is set, an activity with a matching intent filter is launched when user clicks the notification. For example, if one of your Activities includes the intent filter: (Appendix:1)Set click_action to OPEN_ACTIVITY_1 to open it. If set, corresponds to category in APNS payload.|
|body_loc_key|iOS|Optional, string|Indicates the key to the body string for localization. On iOS, this corresponds to "loc-key" in APNS payload.|
|body_loc_args|iOS|Optional, JSON array as string|Indicates the string value to replace format specifiers in body string for localization. On iOS, this corresponds to "loc-args" in APNS payload.|
|title_loc_args|iOS|Optional, JSON array as string|Indicates the string value to replace format specifiers in title string for localization. On iOS, this corresponds to "title-loc-args" in APNS payload.|
|title_loc_key|iOS|Optional, string|Indicates the key to the title string for localization. On iOS, this corresponds to "title-loc-key" in APNS payload.|

Notice notification payload defined in [GCM Connection Server Reference](https://developers.google.com/cloud-messaging/server-ref#table1)

## Custom GCM request options

You can provide custom `request` options such as `proxy` and `timeout` for the GCM request. For more information, refer to [the complete list of request options](https://github.com/request/request#requestoptions-callback). Note that the following options cannot be overriden: `method`, `uri`, `body`, as well as the following headers: `Authorization`, `Content-Type`, and `Content-Length`.

```js
// Set custom request options
var requestOptions = {
	proxy: 'http://127.0.0.1:8888',
	timeout: 5000
};

// Set up gcm with your API key and request options
var gcm = require("node-gcm")('YOUR_API_KEY_HERE', requestOptions);

// Prepare a GCM message...

// Send it to GCM endpoint with modified request options
gcm.send(message, regTokens, function (err, response) {
    if(err) console.error(err);
    else    console.log(response);
});
```

## GCM client compatibility

As of January 9th, 2016, there are a few known compatibility issues with 3rd-party GCM client libraries:

### phonegap-plugin-push

* [No support for subscribing to PubSub topics](https://github.com/phonegap/phonegap-plugin-push/issues/79)
* [Requirement for `data` payload object when sending a `notification` object](https://github.com/phonegap/phonegap-plugin-push/issues/387)
* [Requirement for all 3 `notification` fields when sending a `notification` object (title, icon, message)](https://github.com/ToothlessGear/node-gcm/issues/180)

These issues are out of this project's context and can only be fixed by the respective 3rd-party project maintainers.

## Debug

To enable debug mode (print requests and responses to and from GCM),
set the `DEBUG` environment flag when running your app (assuming you use `node app.js` to run your app):

```bash
DEBUG=node-gcm node app.js
```

## Donate

 Bitcoin: [13iTQf7tDhrKgibw2Y3U5SyPJa7R8sQmHQ](https://blockchain.info/address/13iTQf7tDhrKgibw2Y3U5SyPJa7R8sQmHQ)

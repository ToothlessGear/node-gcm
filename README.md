# node-gcm
[![npm](https://badge.fury.io/js/node-gcm.svg)](https://www.npmjs.com/package/node-gcm)

node-gcm is a Node.JS library for [**Google Cloud Messaging**](https://developers.google.com/cloud-messaging/).

## Installation

```bash
$ npm install node-gcm
```

## Requirements

This library provides the server-side implementation of GCM.
You need to generate an API key ([Sender ID](https://developers.google.com/cloud-messaging/gcm#senderid)).

GCM notifications can be sent to both [Android](https://developers.google.com/cloud-messaging/android/start) and [iOS](https://developers.google.com/cloud-messaging/ios/start).
If you are new to GCM you should probably look into the [documentation](https://developers.google.com/cloud-messaging/gcm).

## Example application

According to below **Usage** reference, we could create such application:

```js
var gcm = require('node-gcm');

var message = new gcm.Message();

message.addData('key1', 'msg1');

var regTokens = ['YOUR_REG_TOKEN_HERE'];

// Set up the sender with you API key
var sender = new gcm.Sender('YOUR_API_KEY_HERE');

// Now the sender can be used to send messages
sender.send(message, { registrationTokens: regTokens }, function (err, response) {
	if(err) console.error(err);
	else 	console.log(response);
});

// Send to a topic, with no retry this time
sender.sendNoRetry(message, { topic: '/topics/global' }, function (err, response) {
	if(err) console.error(err);
	else 	console.log(response);
});
```

## Usage

```js
var gcm = require('node-gcm');

// Create a message
// ... with default values
var message = new gcm.Message();

// ... or some given values
var message = new gcm.Message({
	collapseKey: 'demo',
	priority: 'high',
	contentAvailable: true,
	delayWhileIdle: true,
	timeToLive: 3,
	restrictedPackageName: "somePackageName",
	dryRun: true,
	data: {
		key1: 'message1',
		key2: 'message2'
	},
	notification: {
		title: "Hello, World",
		icon: "ic_launcher",
		body: "This is a notification that will be displayed ASAP."
	}
});

// Change the message data
// ... as key-value
message.addData('key1','message1');
message.addData('key2','message2');

// ... or as a data object (overwrites previous data object)
message.addData({
	key1: 'message1',
	key2: 'message2'
});

// Set up the sender with you API key
var sender = new gcm.Sender('insert Google Server API Key here');

// Add the registration tokens of the devices you want to send to
var registrationTokens = [];
registrationTokens.push('regToken1');
registrationTokens.push('regToken2');

// Send the message
// ... trying only once
sender.sendNoRetry(message, { registrationTokens: registrationTokens }, function(err, response) {
  if(err) console.error(err);
  else    console.log(response);
});

// ... or retrying
sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
  if(err) console.error(err);
  else    console.log(response);
});

// ... or retrying a specific number of times (10)
sender.send(message, { registrationTokens: registrationTokens }, 10, function (err, response) {
  if(err) console.error(err);
  else    console.log(response);
});
```
## Recipients

You can send push notifications to various recipient types by providing one of the following recipient keys:


|Key|Type|Description|
|---|---|---|
|to|String|A single [registration token](https://developers.google.com/cloud-messaging/android/client#sample-register), [notification key](https://developers.google.com/cloud-messaging/notifications), or [topic](https://developers.google.com/cloud-messaging/topic-messaging).
|topic|String|A single publish/subscribe topic.
|notificationKey|String|Deprecated. A key that groups multiple registration tokens linked to the same user.
|registrationIds|String[]|Deprecated. Use registrationTokens instead.|
|registrationTokens|String[]|A list of registration tokens. Must contain at least 1 and at most 1000 registration tokens.|

If you provide an incorrect recipient key or object type, an `Error` object will be returned to your callback.

Notice that [you can *at most* send notifications to 1000 registration tokens at a time](https://github.com/ToothlessGear/node-gcm/issues/42).
This is due to [a restriction](http://developer.android.com/training/cloudsync/gcm.html) on the side of the GCM API.

## Notification usage

```js

var message = new gcm.Message();

// Add notification payload as key value
message.addNotification('title', 'Alert!!!');
message.addNotification('body', 'Abnormal data access');
message.addNotification('icon', 'ic_launcher');

// as object
message.addNotification({
  title: 'Alert!!!',
  body: 'Abnormal data access',
  icon: 'ic_launcher'
});

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

// Set up the sender with your API key and request options
var sender = new gcm.Sender('YOUR_API_KEY_HERE', requestOptions);

// Prepare a GCM message...

// Send it to GCM endpoint with modified request options
sender.send(message, { registrationTokens: regTokens }, function (err, response) {
    if(err) console.error(err);
    else     console.log(response);
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

# node-gcm

node-gcm is a Node.JS library for [**Google Cloud Messaging for Android**](http://developer.android.com/guide/google/gcm/index.html), which replaces Cloud 2 Device Messaging (C2DM).

## Installation
```bash
$ npm install node-gcm
```
##Requirements

An Android device running 2.2 or newer and an API key as per [GCM getting started guide](http://developer.android.com/guide/google/gcm/gs.html).

## Example application
According to below **Usage** reference, we could create such application:

```js
var gcm = require('node-gcm');

var message = new gcm.Message();

message.addData('key1', 'msg1');

var regIds = ['YOUR_REG_ID_HERE'];

// Set up the sender with you API key
var sender = new gcm.Sender('YOUR_API_KEY_HERE');

//Now the sender can be used to send messages
sender.send(message, regIds, function (err, result) {
	if(err) console.error(err);
	else 	console.log(result);
});

sender.sendNoRetry(message, regIds, function (err, result) {
	if(err) console.error(err);
	else 	console.log(result);
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
	delayWhileIdle: true,
	timeToLive: 3,
	data: {
		key1: 'message1',
		key2: 'message2'
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

// Change the message variables
message.collapseKey = 'demo';
message.delayWhileIdle = true;
message.timeToLive = 3;
message.dryRun = true;

// Set up the sender with you API key
var sender = new gcm.Sender('insert Google Server API Key here');

// Add the registration IDs of the devices you want to send to
var registrationIds = [];
registrationIds.push('regId1');
registrationIds.push('regId2');

// Send the message
// ... trying only once
sender.sendNoRetry(message, registrationIds, function(err, result) {
  if(err) console.error(err);
  else    console.log(result);
});

// ... or retrying
sender.send(message, registrationIds, function (err, result) {
  if(err) console.error(err);
  else    console.log(result);
});

// ... or retrying a specific number of times (10)
sender.send(message, registrationIds, 10, function (err, result) {
  if(err) console.error(err);
  else    console.log(result);
});
```
Notice that [you can *at most* send notifications to 1000 registration ids at a time](https://github.com/ToothlessGear/node-gcm/issues/42).
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
|title|Android, iOS (Watch)|equired (Android), Optional (iOS), string|Indicates notification title. This field is not visible on iOS phones and tablets.|
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

## Debug
To enable debug mode (print requests and responses to and from GCM),
set the `DEBUG` environment flag when running your app (assuming you use `node app.js` to run your app):

```bash
DEBUG=node-gcm node app.js
```

## Donate

 Bitcoin: [13iTQf7tDhrKgibw2Y3U5SyPJa7R8sQmHQ](https://blockchain.info/address/13iTQf7tDhrKgibw2Y3U5SyPJa7R8sQmHQ)

## Contributing

Do you see an issue in the code that is not represented by the [issues](https://github.com/ToothlessGear/node-gcm/issues), please do create it.

If you want to help solve an issue, please [submit a Pull Request](https://github.com/ToothlessGear/node-gcm/compare) (PR).
If the PR aims to solve a known issue, please refer this issue in your description.
Make sure that your PR explains what problem it solves, and any key decisions made in regards to this.
Make the PR *early* so maintainers and other contributors get a chance to give input on your code and how it fits in the bigger picture.

Any help is much appreciated!

## Contributors
 * [monkbroc](https://github.com/monkbroc)
 * [zlyinfinite](https://github.com/zlyinfinite)
 * [Yann Biancheri](https://github.com/yannooo)
 * [Hamid Palo](https://github.com/hamidp)
 * [Dotan J.Nahum](https://github.com/jondot)
 * [Olivier Poitrey](https://github.com/rs)
 * [Max Rabin](https://github.com/maxrabin)
 * [George Miroshnykov](https://github.com/laggyluke)
 * [Alejandro Garcia](https://github.com/Alegege)
 * [Ismael Gorissen](https://github.com/igorissen)
 * [Joris Verbogt](https://github.com/silentjohnny)
 * [goelvivek](https://github.com/goelvivek)
 * [Lars Jacob](https://github.com/jaclar)
 * [Roman Iakovlev](https://github.com/RomanIakovlev) 
 * [Roman Skvazh](https://github.com/rskvazh)
 * [Jeremy Goldstein](https://github.com/jg10)
 * [Adam Patacchiola](https://github.com/surespot)
 * [Ivan Longin](https://github.com/ilongin)
 * [Paul Bininda](https://github.com/pbininda)
 * [Niels Roesen Abildgaard](https://github.com/hypesystem)
 * [Nonemoticoner](https://github.com/Nonemoticoner)
 * [Simen Bekkhus](https://github.com/SimenB)
 * [Alexander Johansson](https://github.com/KATT)
 * [Ashwin R](https://github.com/ashrko619)
 * [kaija](https://github.com/kaija)

## License 

(The MIT License)

Copyright (c) 2013 Marcus Farkas &lt;toothlessgear@finitebox.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

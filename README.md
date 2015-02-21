# node-gcm

node-gcm is a Node.JS library for [**Google Cloud Messaging for Android**](http://developer.android.com/guide/google/gcm/index.html), which replaces Cloud 2 Device Messaging (C2DM).

## Installation
```bash
$ npm install node-gcm
```
##Requirements

An Android device running 2.2 or newer and an API key as per [GCM getting started guide](http://developer.android.com/guide/google/gcm/gs.html).

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

### Debug
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

## Changelog

**0.9.15**
 * Updated *Contributing* section in README
 * Rewrote `Sender#send`, so it returns the correct result ordered as expected, even after retrying.
   The initial backoff time can now be specified, by passing an options object to the function.
 * Updated `Sender#send` and `Sender#sendNoRetry` to allow passing a single Registration ID without wrapping it in an array.

**0.9.14**
 * `Message#addData` is now multi-purpose (works as either `Message#addDataWithObject` or `Message#addDataWithKeyValue`)
 * clarified README usage example
 * clarified README debug section
 * made `Sender#send` have a default of 5 retries (if none provided)

**0.9.13**
 * print server responses on invalid requests while in debug mode
 * fixed engine version in package.json (now correctly states >= 10)
 * callbacks to `Sender#send` and `Sender#sendNoRetry` are now optional

**0.9.12**
 * added debug module and removed console-logs
 * use exponential retry instead of linear
 * update request module with most recent compatible one
 * remove require on global timers
 * various cleanups
 * add maxSockets option
 * keep 'this' on Sender object in retries
 * updated README
 * updated contributors

**0.9.11**
 * check >= 500 error status
 * just reassign id array on err, don't iterate
 * send err to callback
 * resend if send multiple errs
 * check for not result instead of result === undefined
 * updated README
 * updated contributors

**0.9.10**
 * Added dryRun message parameter
 * updated README
 * updated contributors
 
**0.9.9**
 * fix statusCode logging
 * Added a call of a callback function in case when no registration id were given
 * updated contributors
 
**0.9.8**
 * Added support for sending POSTs to GCM through http/https proxies.
 * updated contributors

**0.9.7**
 * move callback outside of try catch block
 * updated README
 * updated contributors
 
**0.9.6:**
 * fixed undefined "data" var
 * made constructor argument optional
 * added back addData method
 * updated README
 * updated contributors

**0.9.5:**
 * change addData to addDataWithKeyValue
 * add new function addDataWithObject
 * message object can be initialised with another object
 * updated contributors

**0.9.4:**
 * fix TypeError
 * updated contributors
 * updated README

**0.9.3:**
 * new callback-style (Please check the example above)
 * fixes various issues (Read commit messages)
 * not making a distinction between a single and multiple result makes it easier for application-land code to handle

**0.9.2:**
 * added error handler to HTTPS request to handle DNS exceptions
 * added multicast-messaging

**0.9.1:**
 * first release

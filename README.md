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

var message = new gcm.Message();
var sender = new gcm.Sender('insert Google Server API Key here');
var registrationIds = [];

// Optional
message.addData('key1','message1');
message.addData('key2','message2');
message.collapseKey = 'demo';
message.delayWhileIdle = true;
message.timeToLive = 3;

// At least one required
registrationIds.push('regId1');
registrationIds.push('regId2'); 

/**
 * Parameters: message-literal, registrationIds-array, No. of retries, callback-function
 */
sender.send(message, registrationIds, 4, function (result) {
	console.log(result);
});
```

And without retries
```js
sender.sendNoRetry(message, registrationIds-array, function (result) {
	console.log(result);
});
```

## Contributors
 * [monkbroc](https://github.com/monkbroc)
 * [zlyinfinite](https://github.com/zlyinfinite)
 * [Yann Biancheri](https://github.com/yannooo)
 * [Hamid Palo](https://github.com/hamidp)

## License 

(The MIT License)

Copyright (c) 2012 Marcus Farkas &lt;marcus.farkas@spaceteam.at&gt;

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
**0.9.2:**
 * added error handler to HTTPS request to handle DNS exceptions (Thanks goes to [monkbroc](https://github.com/monkbroc))
 * added multicast-messaging

**0.9.1:**
 * First release


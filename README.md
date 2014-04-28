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

// create a message with default values
var message = new gcm.Message();

// or with object values
var message = new gcm.Message({
	collapseKey: 'demo',
	delayWhileIdle: true,
	timeToLive: 3,
	data: {
		key1: 'message1',
		key2: 'message2'
	}
});

var sender = new gcm.Sender('insert Google Server API Key here');
var registrationIds = [];

// OPTIONAL
// add new key-value in data object
message.addDataWithKeyValue('key1','message1');
message.addDataWithKeyValue('key2','message2');

// or add a data object
message.addDataWithObject({
	key1: 'message1',
	key2: 'message2'
});

// or with backwards compability of previous versions
message.addData('key1','message1');
message.addData('key2','message2');


message.collapseKey = 'demo';
message.delayWhileIdle = true;
message.timeToLive = 3;
message.dryRun = true;
// END OPTIONAL

// At least one required
registrationIds.push('regId1');
registrationIds.push('regId2'); 

/**
 * Params: message-literal, registrationIds-array, No. of retries, callback-function
 **/
sender.send(message, registrationIds, 4, function (err, result) {
	console.log(result);
});
```

And without retries
```js
sender.sendNoRetry(message, registrationIds-array, function (err, result) {
	console.log(result);
});
```

## Donate

 Bitcoin: [13iTQf7tDhrKgibw2Y3U5SyPJa7R8sQmHQ](https://blockchain.info/address/13iTQf7tDhrKgibw2Y3U5SyPJa7R8sQmHQ)

## Contribute!

If you don't want to create a GitHub-Account, but still feel the urge to contribute... no problem!
Just send me an [email](mailto:toothlessgear@finitebox.com) with your 
pull request from your private repository.
Of course, you can also send me a patch directly inline your mail.
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

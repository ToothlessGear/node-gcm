# node-gcm

node-gcm is a Node.JS library for [**Google Cloud Messaging for Android**](http://developer.android.com/guide/google/gcm/index.html), which replaces Cloud 2 Device Messaging (C2DM).

## Installation
```bash
$ npm install node-gcm
```

## Usage

More features, such as multicast-messaging and a sample webserver, will come soon.
```js
var gcm = require('node-gcm');
var registrationId = 'insert yours here'; 


var message = new gcm.Message();
var sender = new gcm.Sender('insert Google Server API Key here');


message.addData('key1','message1');
message.addData('key2','message2');

/**
 * Parameters: Message-literal, registrationId, No. of retries, callback-function
 */
sender.send(message, registrationId, 4, function (result) {
	console.log(result);
});
```

And without retries
```js
sender.sendNoRetry(message, registrationId, function (result) {
	console.log(result);
});
```

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

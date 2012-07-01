/*!
 * node-gcm
 * Copyright(c) 2012 Marcus Farkas <marcus.farkas@spaceteam.at>
 * MIT Licensed
 */

var Constants = require('./constants');
var Message = require('./message');
var Result = require('./result');
var MulitcastResult = require('./multicastresult');
var querystring = require('querystring');

var https = require('https');

exports = module.exports = Sender;

function Sender (key) {
	this.key = key;
};

/* Unfinished
Sender.prototype.send = function(message, registrationId, retries) {
	var attempt = 0;
	var result;
	var backoff = Constants.BACKOFF_INITIAL_DELAY;
	var tryAgain;
	do {
		attempt++;
		this.sendNoRetry(message, registrationId);
		tryAgain = result === undefined && attempt <= retries;
	} while (tryAgain)
	if (result === undefined) {
		console.log('Could not send message after ' + attempt + 'attempts');
	}

	return result;
};
*/

Sender.prototype.sendNoRetry = function(message, registrationId) {
	var body = {};
	body[Constants.PARAM_REGISTRATION_ID] = registrationId;
	if (message.delayWhileIdle !== undefined) {
		body[Constants.PARAM_DELAY_WHILE_IDLE] = message.delayWhileIdle ? '1' : '0';
	}
	if (message.collapseKey !== undefined) {
		body[Constants.PARAM_COLLAPSE_KEY] = message.collapseKey;
	}
	for (var data in message.data) {
		body[Constants.PARAM_PAYLOAD_PREFIX + data] = message.data[data];
	}

	var requestBody = querystring.stringify(body);
	this.post(requestBody);
};

Sender.prototype.post = function (requestBody) {
	
	var post_options = {
      	host: Constants.GCM_SEND_ENDPOINT,
      	port: '443',
      	path: Constants.GCM_SEND_ENDPATH,
      	method: 'POST',
      	headers: {
          	'Content-Type' : 'application/x-www-form-urlencoded',
          	'Content-length' : requestBody.length,
          	'Authorization' : 'key=' + this.key
      	}
  	};

  	var post_req = https.request(post_options, function(res) {

      	res.setEncoding('utf-8');
      	res.on('data', function (chunk) {
        	console.log('Response: ' + chunk);
    	});
  	});

  	post_req.write(requestBody);
  	post_req.end();
};

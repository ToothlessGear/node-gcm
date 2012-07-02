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

Sender.prototype.send = function(message, registrationId, retries, callback) {
	var attempt = 1;
	var result;
	var backoff = Constants.BACKOFF_INITIAL_DELAY;
	var tryAgain;

		this.sendNoRetry(message, registrationId, function lambda (result) {
			if(result === undefined) {
				if(attempt <= retries) {
					sendNoRetryMethod(message, registrationId, lambda);
				}
				else console.log('Could not send message after ' + attempt + 'attempts'); 
				attempt++;
			}
			else callback(result);
		});
};

var sendNoRetryMethod = Sender.prototype.sendNoRetry = function(message, registrationId, callback) {
	var body = {}, result = new Result();
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
      	var statusCode = res.statusCode;

      	res.on('data', function (data) {
        	if (data.indexOf('Error=') === 0) {
                result.errorCode = data.substring(6).trim();
                callback(result);
            }
            else if (data.indexOf('id=') === 0) {
                result.messageId = data.substring(3).trim();
                callback(result);
            }
            else callback();

    	});
  	});

  	post_req.write(requestBody);
  	post_req.end();
};
var Constants = require('./constants');
var req = require('request');
var Sender = require('./sender');
var debug = require('debug')('node-gcm');

//Set the name Instance Id from the google API docs
function InstanceId(key, options) {
    if (!(this instanceof InstanceId)) {
        return new InstanceId(key, options);
    }

    this.key = key;
    // Will be useful when implementing retries
    this.options = options;
}

// This function will add a user or a list of users to a topic.
InstanceId.prototype.addToTopicNoRetry = function(topic, subscriber, callback) {
    console.log(' addToTopicNoRetry of instance id inside node-gcm');
    if(!callback) {
        callback = function() {};
    }

    if(typeof topic != "string" || topic == "" ) {
    	debug('Incorrect topic provided!');
    	return process.nextTick(callback.bind(this, 'Incorrect topic provided!', null));
    }

    var singleSubscriber;
    var subscriberList;

    //TODO: create a separate function for this piece of code & use in sender.js as well
    if(typeof subscriber == "string") {
        console.log(' subscriber passed is a string.  ');
        singleSubscriber = subscriber;
    }
    else if (!Array.isArray(subscriber) && typeof subscriber == "object") {
        console.log('subscriber is not a list but an object.  ');
        var o = Sender.extractRecipient(subscriber);
        var theRecipient;

        if (o.err) {
            return callback(o.err);
        }
        else {
            theRecipient = o.recipient;
        }

        if (Array.isArray(theRecipient)) {
            subscriberList = theRecipient;
        }
        else {
            singleSubscriber = theRecipient;
        }
    }
    else {
        console.log('subscriber is a list');
        if (Array.isArray(subscriber) && subscriber.length == 1) {
            singleSubscriber = subscriber[0];
        }
        else {
            subscriberList = subscriber;
        }
    }

    if(singleSubscriber != null){
        console.log('subscriber not null ,initiating a post request to the IID endpoint.');

	    var post_options = {
	        method: 'POST',
	        headers: {
	            'Authorization': 'key=' + this.key
	        },
	        uri: Constants.GCM_IID_ENDPOINT+Constants.GCM_SUBSCRIPTION_ENDPATH_1+singleSubscriber+Constants.GCM_SUBSCRIPTION_ENDPATH_2+topic
	    };
        var resBodyJSON;
	    var post_req = req(post_options, function (err, res, resBodyJSON) {
	    	if (err) {
	            return callback(err, null);
	        }

	        if (!res) {
	            return callback('response is null', null);
	        }

	        if (res.statusCode >= 500) {
	            debug('GCM service is unavailable (500)');
	            return callback(res.statusCode, null);
	        } else if (res.statusCode === 401) {
	            debug('Unauthorized (401). Check that your API token is correct.');
	            return callback(res.statusCode, null);
	        } else if (res.statusCode !== 200) {
	            debug('Invalid request (' + res.statusCode + '): ' + resBodyJSON);
	            return callback(res.statusCode, null);
	        }

	        callback(null, resBodyJSON);
	    });


    }
    else if (subscriberList != null){
    	var body = {};
        // Gcm documentation is currently incorrect, http://stackoverflow.com/questions/35177152/topic-name-format-is-invalid-when-trying-to-subscribe-to-gcm-topic
    	body.to='/topics/'+topic;
    	body.registration_tokens=subscriberList;

    	var post_options = {
	        method: 'POST',
	        headers: {
	            'Authorization': 'key=' + this.key
	        },
	        uri: Constants.GCM_IID_SUBSCRIBE_URI,
	        json: body
	    };

	    var post_req = req(post_options, function (err, res, resBodyJSON) {
	    	if (err) {
	            return callback(err, null);
	        }

	        if (!res) {
	            return callback('response is null', null);
	        }

	        if (res.statusCode >= 500) {
	            debug('GCM service is unavailable (500)');
	            return callback(res.statusCode, null);
	        } else if (res.statusCode === 401) {
	            debug('Unauthorized (401). Check that your API token is correct.');
	            return callback(res.statusCode, null);
	        } else if (res.statusCode !== 200) {
	            debug('Invalid request (' + res.statusCode + '): ' + resBodyJSON);
	            return callback(res.statusCode, null);
	        }

	        callback(null, resBodyJSON);
	    });

    }
    else{
    	debug('No subscribers provided!');
    	return process.nextTick(callback.bind(this, 'No subscribers provided!', null));
    }


};

//TODO: implement batch unsubscription
//TODO: implement a funciton which returs list of subscribed groups using info and setting details as true.

InstanceId.prototype.info = function(token, callback) {
	if(typeof token != "string") {
     	debug('Incorrect Instance ID token passed!');
    	return process.nextTick(callback.bind(this, 'Incorrect Instance ID token passed!', null));   
    }

    //TODO: letting users pass details=true and pass on in the url 
    var post_options = {
        method: 'POST',
        headers: {
            'Authorization': 'key=' + this.key
        },
        uri: Constants.GCM_IID_ENDPOINT+Constants.GCM_INFO_ENDPATH+token
    };

    //TODO: create in a separate function, as this part of code is used twice in this file & once in sender.js 
	var post_req = req(post_options, function (err, res, resBodyJSON) {
    	if (err) {
            return callback(err, null);
        }

        if (!res) {
            return callback('response is null', null);
        }

        if (res.statusCode >= 500) {
            debug('GCM service is unavailable (500)');
            return callback(res.statusCode, null);
        } else if (res.statusCode === 401) {
            debug('Unauthorized (401). Check that your API token is correct.');
            return callback(res.statusCode, null);
        } else if (res.statusCode !== 200) {
            debug('Invalid request (' + res.statusCode + '): ' + resBodyJSON);
            return callback(res.statusCode, null);
        }

        callback(null, resBodyJSON);
    });



}

module.exports = InstanceId;

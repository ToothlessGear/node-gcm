var gcm = require('../lib/node-gcm');

var message = new gcm.Message();

message.addData('hello', 'world');
message.addNotification('title', 'Hello');
message.addNotification('icon', 'ic_launcher');
message.addNotification('body', 'World');


//Add your mobile device registration tokens here
var regTokens = ['ecG3ps_bNBk:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxXl7TDJkW'];
//Replace your developer API key with GCM enabled here
var sender = new gcm.Sender('AIza*******************5O6FM');

sender.send(message, regTokens, function (err, result) {
    if(err) {
      console.error(err);
    } else {
      console.log(result);
    }
});

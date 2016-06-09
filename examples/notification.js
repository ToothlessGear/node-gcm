//Replace your developer API key with GCM enabled here
var gcm = require('../index')('AIza*******************5O6FM');

var message = {
    data: {
        hello: 'world'
    },
    notification: {
        title: 'Hello',
        icon: 'ic_launcher',
        body: 'World'
    }
};

//Add your mobile device registration tokens here
var regTokens = ['ecG3ps_bNBk:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxXl7TDJkW'];

gcm.send(message, regTokens, function (err, response) {
    if(err) {
      console.error(err);
    } else {
      console.log(response);
    }
});

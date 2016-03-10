var client = require('./file-client')();

client.start(function (data){
  if (data)
    console.log('connected to server');

});

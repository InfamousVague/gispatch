export var execute = function(command, config, callback){
    var Client = require('ssh2').Client;
    var conn = new Client();
    conn.on('ready', function() {
      callback('Client :: ready');
      conn.exec(command, function(err, stream) {
        if (err) throw err;
        stream.on('close', function(code, signal) {
          conn.end();
        }).on('data', function(data) {
          callback(data);
        }).stderr.on('data', function(data) {
          callback(data);
        });
      });
    }).connect({
      host: config.host,
      port: 22,
      username: config.user,
      password: config.pass
    });
};

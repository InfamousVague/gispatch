export var msgDisplay = function(type, msg){
    if(type === 'error'){
        $('#status-msg').html(msg).addClass('error');
    }else{
        $('#status-msg').html(msg).removeClass('error');
    }
};

export var checkError = function(err){
    if(err.toString() === 'Error: Timed out while waiting for handshake' ||
        err.toString() === 'Error: Invalid username' ||
        err.toString() === 'Error: All configured authentication methods failed' ||
        err.toString() === 'Error: connect ECONNREFUSED' ||
        err.toString() === 'Error: getaddrinfo ENOTFOUND'){
        $('#conn').html('failed, retry?');
        $('#conn').addClass('btn-red');
    }
}

export var generateConfig = function(user, host, pass){
    var file = '{\n';
    file += '"user": "' + user + '",\n';
    file += '"host": "' + host + '",\n';
    file += '"pass": "' + pass + '"\n';
    file += '}';
    var fs = require('fs');
    fs.writeFile('./config.json', file, function (err) {
      if (err) throw err;

    });
};

export var startLoading = function(){
    $('#loadingIcon').addClass('fa-spin');
};

export var stopLoading = function(){
    $('#loadingIcon').removeClass('fa-spin');
};

import { toolbar } from './js/components/toolbar';
import { statusbar } from './js/components/statusbar';
import { sidebar } from './js/components/sidebar';
import { execute } from './js/components/execute';
import {
    msgDisplay, generateConfig, startLoading, stopLoading, checkError
    } from './js/components/core';
import { connect } from './js/components/connect';

import { InitConfig } from './config';

var ConfigString = JSON.stringify(InitConfig);
var Config = JSON.parse(ConfigString);

process.on('uncaughtException', function(err) {
    msgDisplay('error', err.toString());
    checkError(err);
});

var Client = require('ssh2').Client;
var conn = new Client();
var ssh_connect = function(command, callback){
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
      host: Config.host,
      port: 22,
      username: Config.user,
      password: Config.pass
    });
}


// SSH
var ssh_execute = function(command, callback){
    var exec_conn = new Client();
    exec_conn.on('ready', function() {
        exec_conn.exec(command, function(err, stream) {
        if (err) throw err;
        stream.on('close', function(code, signal) {
            exec_conn.end();
            stopLoading();
        }).on('data', function(data) {
            callback(data);
        }).stderr.on('data', function(data) {
            callback(data);
        });
      });
    }).connect({
      host: Config.host,
      port: 22,
      username: Config.user,
      password: Config.pass
    });
};

$(document).on('click', '#ssh_exec', function(e){
    e.preventDefault();
    startLoading();
    var ssh_cmd = $('#ssh_cmd').val().replace(' ', '\u0020') + '\u0020';

    $('#term').append('> ' + ssh_cmd.toString() + '<br>');
    ssh_execute(ssh_cmd, function(data){
        $('#term').append(data.toString() + '<br>');
    });
});

var testCommand = function(){
    startLoading();
    ssh_connect('echo "connected successfully"', function(response){
        msgDisplay('normal', response.toString());
        stopLoading();
        $('#conn').html('success!');
        $('#conn').removeClass('btn-red');
    });
};

var ready = function(){
    var checkConfig = function(){
        if ( Config.user.toString() != "notsetup"){
            setTimeout(function(){
                $('#user').val(Config.user);
                $('#host').val(Config.host);
                $('#pass').val(Config.pass);
            }, 50);

            startLoading();
            ssh_connect('echo "connected successfully"', function(response){
                msgDisplay('normal', response.toString());
                stopLoading();
                $('#conn').html('success!');
                $('#conn').removeClass('btn-red');
            });
        }else{
            $('#frame').load('components/connect.html');
        }
    };
    checkConfig();
    $(document).on('click', '#sidebar a', function(){
        $('#sidebar li').removeClass('active');
        $(this).parent().addClass('active');
        $('#frame').html('');
        switch ($(this).data('module')){
            case 'connect':
                $('#frame').load('components/connect.html');
                $(document).ready(function(){
                    checkConfig();
                });

                break;
            case 'terminal':
                $('#frame').load('components/terminal.html');

                break;
        }
    });
};

$(document).on('click', '#conn', function(e){
    $(this).html('<i class="fa fa-circle-o-notch fa-spin"></i>');
    var user = String(document.getElementById('user').value);
    var host = String(document.getElementById('host').value);
    var pass = String(document.getElementById('pass').value);
    generateConfig(user, host, pass);

    // Generate a temporary file
    var file = "";
    file += '{\n';
    file += '"user": "' + user + '",\n';
    file += '"host": "' + host + '",\n';
    file += '"pass": "' + pass + '"\n';
    file += '}';

    Config = JSON.parse(file);

    testCommand();
});


(function init(){
    toolbar();
    statusbar();
    sidebar();

    ready();
})();

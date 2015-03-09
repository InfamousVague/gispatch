import { toolbar } from './js/components/toolbar';
import { statusbar } from './js/components/statusbar';
import { sidebar } from './js/components/sidebar';
import { execute } from './js/components/execute';
import {
            msgDisplay, generateConfig, startLoading,
            stopLoading, checkError
        } from './js/components/core';

import { connect } from './js/components/connect';
import { ssh_execute } from './js/components/ssh_connect';
import { checkRunning } from './js/components/check_running';

var Config = {
    "user": "notsetup",
    "host": "notsetup",
    "pass": "notsetup"
};
$.getJSON( "./config.json", function( data ) {
    Config = data;
    Config.pass = atob(Config.pass);
}).fail(function() {
    Config = {
        "user": "notsetup",
        "host": "notsetup",
        "pass": "notsetup"
    };
});


var checkConfig = function(){
    if ( Config.user.toString() != "notsetup"){
        setTimeout(function(){
            $('#user').val(Config.user);
            $('#host').val(Config.host);
            $('#pass').val(Config.pass);
        }, 50);

        startLoading();
        ssh_execute(Config, 'echo "connected successfully"', function(response){
            msgDisplay('normal', response.toString());
            stopLoading();
            $('#conn').html('success!');
            $('#conn').removeClass('btn-red');
        });
    }else{
        $('#frame').load('components/connect.html');
    }
};

setTimeout(function(){
    $('#frame').load('components/deploy.html');
    checkConfig();
}, 500);


process.on('uncaughtException', function(err) {
    msgDisplay('error', err.toString());
    checkError(err);
});


$(document).on('click', '.stop', function(e){
    e.preventDefault();
    var command = "forever stop " + $(this).data('pid');
    ssh_execute(Config, command, function(data){
        msgDisplay('basic', data.toString());
        checkRunning(Config, function(options){
            stopLoading();
        });
    });
});

$(document).on('click', '.restart', function(e){
    e.preventDefault();
    var command = "forever restart " + $(this).data('pid');
    ssh_execute(Config, command, function(data){
        msgDisplay('basic', data.toString());
        checkRunning(Config, function(options){
            stopLoading();
        });
    });
});

$(document).on('click', '#deploy-btn', function(e){
    e.preventDefault();
    startLoading();
    var gitRepo = $('#git-url').val();
    var application = gitRepo.match(/\/([^/]*)$/)[1];
    var trimmedApplication = application.substring(0, application.length - 4);
    var entryPoint = $('#entry-point').val();

    var ssh_cmd = "git clone " + gitRepo + " && forever start " + trimmedApplication + "/" + entryPoint;

    ssh_execute(Config, ssh_cmd, function(data){
        msgDisplay('basic', data.toString());
        stopLoading();

        $('#deploy-btn').html('Success!');
    });

    setTimeout(function(){
        $('#deploy-btn').html('Deploy!');
    }, 1500);
});

$(document).on('click', '#ssh_exec', function(e){
    e.preventDefault();
    startLoading();
    var ssh_cmd = $('#ssh_cmd').val().replace(' ', '\u0020') + '\u0020';

    $('#term').append('> ' + ssh_cmd.toString() + '<br>');
    ssh_execute(Config, ssh_cmd, function(data){
        $('#term').append(data.toString() + '<br>');
        stopLoading();
    });
});

var testCommand = function(){
    startLoading();
    ssh_execute(Config, 'echo "connected successfully"', function(response){
        msgDisplay('normal', response.toString());
        stopLoading();
        $('#conn').html('success!');
        $('#conn').removeClass('btn-red');
    });
};

var ready = function(){
    $(document).on('click', '#sidebar a', function(){
        $('#sidebar li').removeClass('active');
        $(this).parent().addClass('active');
        $('#frame').html(' ');
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

            case 'deploy':
                $('#frame').load('components/deploy.html');
                break;

            case 'running-apps':
                $('#frame').load('components/running.html');
                checkRunning(Config, function(options){

                });
                break;
        }
    });
};

$(document).on('click', '#conn', function(e){
    $(this).html('<i class="fa fa-circle-o-notch fa-spin"></i>');
    var user = String(document.getElementById('user').value);
    var host = String(document.getElementById('host').value);
    var pass = String(document.getElementById('pass').value);
    generateConfig(user, host, btoa(pass));

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

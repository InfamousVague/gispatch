export var checkRunning = function(Config, callback){
    var command = "forever list --plain";
    $('#loadingIcon').addClass('fa-spin');
    var foreverRaw = [];
    var calculateForeverData = function(){
        foreverRaw.shift();
        if(typeof(foreverRaw) != 'undefined'){
            var info = foreverRaw[0].split(' ').filter(Boolean);
            foreverRaw.shift();

            var instances = [];
            foreverRaw.map(function(app){
                var foreverFormatted = app.split(' ').filter(Boolean);
                foreverFormatted.shift();
                var appObj = {
                    uid: foreverFormatted[1],
                    command: foreverFormatted[2],
                    script: foreverFormatted[3],
                    pid: foreverFormatted[4],
                    id: foreverFormatted[5],
                    logfile: foreverFormatted[6],
                    uptime: foreverFormatted[7]
                };
                instances.push(appObj);
            });

            $('#running_table').html("<tr><th>Application Name</th><th>PID</th><th>ID</th><th>Uptime</th><th>Stop</th><th>Restart</th></tr>");
            instances.map(function(app){
                var tr = "<tr>";
                tr += "<td>" + app.script.split('/')[0] + "</td>";
                tr += "<td>" + app.pid + "</td>";
                tr += "<td>" + app.id + "</td>";
                tr += "<td>" + app.uptime + "</td>";
                tr += "<td><button class='stop btn-red btn' data-pid='" + app.script + "'>Stop</button></td>";
                tr += "<td><button class='restart btn-orange btn' data-pid='" + app.script + "'>Restart</button></td>";
                tr += "</tr>";
                $('#running_table').append(tr);
            });
        }

    };


    var Client = require('ssh2').Client;
    var conn = new Client();
    conn.on('ready', function() {
      conn.exec(command, function(err, stream) {
        if (err) throw err;
        stream.on('close', function(code, signal) {
            conn.end();
            calculateForeverData();
            $('#loadingIcon').removeClass('fa-spin');
        }).on('data', function(data) {
            foreverRaw.push(data.toString());
        }).stderr.on('data', function(data) {

        });
      });
    }).connect({
      host: Config.host,
      port: 22,
      username: Config.user,
      password: Config.pass
    });
};

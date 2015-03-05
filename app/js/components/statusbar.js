export var statusbar = function(){
    var fs      = require('fs'),
        pjson   = require('./package.json');

    fs.readFile('components/statusbar.html', function(err, data){
        $('#gispatch').append(data.toString());
        $('#version').html('version ' + pjson.version);
    });
    
};

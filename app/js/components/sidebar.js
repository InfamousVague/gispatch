export var sidebar = function(){
    var fs = require('fs');

    fs.readFile('components/sidebar.html', function(err, data){
        $('#gispatch').append(data.toString());
    });

};

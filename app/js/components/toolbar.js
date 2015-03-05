export var toolbar = function(){
    var gui        = require('nw.gui'),
        win        = gui.Window.get(),
        fs         = require('fs');

    $(document).on('click', '#close', function(e){
        e.preventDefault();
        win.close();
    });

    $(document).on('click', '#minimize', function(e){
        e.preventDefault();
        win.minimize();
    });

    fs.readFile('components/toolbar.html', function(err, data){
        $('#gispatch').append(data.toString());
    });
};

var spawn = require('child_process').spawn;


exports.GetRandomPort =function(min,max){
        var port = randomIntFromInterval(min,max);
        // console.log("min:"+min+", max:"+max+" = "+port);
        return port;
};

exports.OpenGameInstance = function(path,port){
        var arguments = ["-port", port];

        var child = spawn(path, arguments);

            child.stdout.on('data', function (data) {
                // console.log('stdout: ' + data);
            });

            child.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
            });

            child.on('close', function (code) {

                console.log('Game instance with port ' + port + " exited with code " + code);
        });
};

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}
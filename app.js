console.log("Starting Cupid v1")
console.log("")
const { response } = require('express');
const { exec, execFile } = require('child_process');
var spawn = require('child_process').spawn;
const express = require('express')
const app = express()
require('./settings')();
const Helpers = require('./helpers');
const { start } = require('repl');


//Read settings
var settings = ReadSettings();
if (settings == null) { return; }

console.log(settings);

var Rooms = [];

// Rooms.push({Port:"2002",Players:["Player1","Player2"]})
app.get('/settings',(req,res)=>{
    if(req.query.password != settings.password){
        res.send("403 Unauthorized")
        return;
    }
    var m_settings = {minimum_players:settings.minimum_players, maximum_players:settings.maximum_players, waiting_time:settings.waiting_time}
    res.send(m_settings);
})
app.get('/', (req, res) => {
    
    var username = req.query.username ?? "";
    var password = req.query.password ?? "";
    if (password != settings.password) {
        res.send("403 Unauthorized");
        console.log("Unauthorized call " + password + ":" + settings.password);
        return;
    }
    if (username.length < 2) {
        res.send("Bad credentials");
        return;
    }
    // res.send('1')
    var myRoomId = -1;
    var possibleRoomId = -1;
    var expiredRooms = [];

    //TODO: Make this loop go backwards and remove the extra loop below
    for (var i = 0; i < Rooms.length; i++) {

        if(Rooms[i].Players.length >= settings.minimum_players){
            var expireDate = Rooms[i].Time + settings.waiting_time;
            var timeToLive = expireDate - Date.now();

            if(timeToLive <0){
                //expired
                console.log(Rooms[i]);
                console.log(" is expired.");
                expiredRooms.push(i);
            }else{
                if(timeToLive < 4){
                    console.log(Rooms[i].Port + " Port room will be expired in " + timeToLive);
                }
                // console.log("Room " + i + " will be expired  in " + expireDate + "-" + Date.now() + "=" + timeToLive);
            }
        }
    }
    //Purge expired rooms
    for(var i=expiredRooms.length-1; i>=0; i--){
        Rooms.pop(expiredRooms[i]);
        if(possibleRoomId == expiredRooms[i]){
            possibleRoomId =-1;
        }
        if(myRoomId == expiredRooms[i]){
            myRoomId =-1;
        } 
    }

    
    for (var i = 0; i < Rooms.length; i++) {
        if(myRoomId > -1){continue;}
        if (Rooms[i].Players.indexOf(username) > -1) {
            myRoomId = i;
        } else {
            if (Rooms[i].Players.length < settings.maximum_players) {
                console.log("found possible room " + i);
                possibleRoomId = i;
            }
        }
    }

    if (myRoomId == -1) {
        if (possibleRoomId == -1) {
            Rooms.push({ Port: Helpers.GetRandomPort(settings.port_range_min, settings.port_range_max), Players: [username], Time: Date.now() })
            myRoomId= Rooms.length-1;
        } else {
            Rooms[possibleRoomId].Players.push(username);
        }
    }
    var selectedRoomId = -1;
    if (myRoomId > -1) {
        //M
        selectedRoomId = myRoomId;
    } else if (possibleRoomId > -1) {
        selectedRoomId = possibleRoomId;
    } else {
        res.send("-1, Error!");
    }

    if (selectedRoomId > -1) {
        if (Rooms[selectedRoomId].Players.length >= settings.minimum_players) {
            res.send("1," + Rooms[selectedRoomId].Port);
            //Spawn server instance
            var arguments = ["-port", Rooms[selectedRoomId].Port];
            console.log(arguments);
            // execFile(settings.game_exe,arguments, {maxBuffer:1024 * 1000}, (err, stdout, stderr) => {
            //     if (err) {
            //         // node couldn't execute the command
            //         console.log(err);
            //         return;
            //     }
            //     console.log("game started correctly?");
            //     // the *entire* stdout and stderr (buffered)
            //     console.log(`stdout: ${stdout}`);
            //     console.log(`stderr: ${stderr}`);
            //   });
            var child = spawn(settings.game_exe, arguments);

            child.stdout.on('data', function (data) {
            // console.log('stdout: ' + data);
            });

            child.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
            });

            child.on('close', function (code) {
                console.log('child process exited with code ' + code);
            });
        } else {
            res.send("0," + Rooms[selectedRoomId].Port);
        }
    }
    console.log(Rooms);

})

app.listen(settings.port);
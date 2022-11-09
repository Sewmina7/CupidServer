console.log("Starting Cupid v1")
console.log("")
const { response } = require('express');
const { exec } = require('child_process');
const express = require('express')
const app = express()
require('./settings')();
const Helpers = require('./helpers');


//Read settings
var settings = ReadSettings();
if (settings == null) { return; }

console.log(settings);

var Rooms = [];

// Rooms.push({Port:"2002",Players:["Player1","Player2"]})
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

    for(var i=expiredRooms.length-1; i>=0; i--){
        Rooms.pop(expiredRooms[i]);
        if(possibleRoomId == expiredRooms[i]){
            possibleRoomId =-1;
        }
        if(myRoomId == expiredRooms[i]){
            myRoomId =-1;
        } 
    }

    if (myRoomId == -1) {
        if (possibleRoomId == -1) {
            Rooms.push({ Port: Helpers.GetRandomPort(settings.port_range_min, settings.port_range_max), Players: [username], Time: Date.now() })
            myRoomId= Rooms.length-1;

            //Spawn server instance
            exec(settings.game_exe, (err, stdout, stderr) => {
                if (err) {
                    // node couldn't execute the command
                    return;
                }
              
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
              });
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
        } else {
            res.send("0," + Rooms[selectedRoomId].Port);
        }
    }
    console.log(Rooms);

})

app.listen(settings.port);
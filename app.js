const version = "v1.0";
console.log("Starting Cupid Matchmaker for unity " + version);

console.log("")
const { response } = require('express');
const express = require('express')
const app = express()
require('./settings')();
const Helpers = require('./helpers');
const { start } = require('repl');

const queueGraceTime = 2000;


//Read settings
var settings = ReadSettings();
if (settings == null) { return; }
const logLevel = settings.log_level;

LogVerbose(settings);

var Rooms = [];
var Queue = [];

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

    if(!ValidateRequest(req,res)){
        return;
    }

    //Check query
    var joinedRoom = null;
    var alreadyOnQueue = false;
    Queue.forEach(element => {
        if(element.Name == username){
            element.LastSeen = Date.now();
            alreadyOnQueue = true;
        }else{
            if(Date.now() - element.LastSeen > queueGraceTime){
                Queue.pop(element);
                Log(`Player ${element.Name} is afk, removing.`)
            }
        }
    });
    
    //Check on rooms if not in the queue, Maybe they already joined a room
    var possibleRoom=null;
    
    Rooms.forEach(element => {
        var roomValid = true;
        if(Date.now() - element.InitTime > settings.waiting_time){
            //This room is expired
            LogDebug("This room is expired, Removing now");
            LogDebug(element);
            Rooms.pop(element);
            roomValid = false;
        }
        if(roomValid){
            element.Players.forEach(player => {
                if(player.Name == username){
                    joinedRoom = element;
                }
            })
            if(element.Players.length == 0){
                Rooms.pop(element);
            }else if(element.Players.length < settings.maximum_players){
                possibleRoom = element;
            }
        }
        
    })    

    if(joinedRoom != null){ //Already in a room. Stopping here
        res.send(joinedRoom)                                                                    // <------- Exit  [ Already in a room ]
        return;
    }

    //Neither in a room nor in queue, Let's see
    if(possibleRoom == null){
        if(Queue.length >= settings.minimum_players){
            var newPort = Helpers.GetRandomPort(settings.port_range_min, settings.port_range_max);
            var newRoom = {Players:[{Name:username, LastSeen: Date.now()}], Port: newPort, InitTime: Date.now()};
            Rooms.push(newRoom);
            Helpers.OpenGameInstance(settings.game_exe, newPort);
            res.send(newRoom);                                                                         // <------- Exit  [ Made a new room ]
            return;
        }
    }else{
        possibleRoom.Players.push({Name:username, LastSeen:Date.now()});
        res.send(possibleRoom);                                                                      // <---------- Exit    [ joining an existing room ]
        return;
    }

    //Not even got a new room. Back to queue
    if(!alreadyOnQueue){
        var newQueueEntry = {Name:username, LastSeen: Date.now()};
        
        LogVerbose(newQueueEntry);
        Queue.push(newQueueEntry);
    }
    LogVerbose("Rooms");
    Rooms.forEach(element=>{
        LogVerbose(element);
    })
    LogVerbose("Queue");
    LogVerbose(Queue);
    res.send("0");                                                                                  // <---------- Exit     [ No room ]
})

app.get('/cancel', (req,res)=>{
    var username = req.query.username ?? "";

    if(!ValidateRequest(req,res)){
        return;
    }
    var foundUser = false;
    Queue.forEach((element)=>{
        if(element.Name == username){
            Queue.pop(element);
            res.send("1");
            foundUser=true;
            return;
        }
    })
    if(!foundUser){
        res.send("Couldn't find user " + username + " in the queue");
    }
})

function ValidateRequest(req, res){
    //Validate request
    var username = req.query.username ?? "";
    var password = req.query.password ?? "";
    if (password != settings.password) {
        res.send("403 Unauthorized");
        LogVerbose("Unauthorized call " + password + ":" + settings.password);
        return false;
    }
    if (username.length < 2) {
        res.send("Bad credentials");
        return false;
    }

    return true;
}

function Log(msg){
    console.log(msg);
}

function LogDebug(msg){
    if(logLevel > 0){
        console.log(msg);
    }
}

function LogVerbose(msg){
    if(logLevel > 1){
        console.log(msg);
    }
}

app.listen(settings.port);
console.log("Listening on port " + settings.port);
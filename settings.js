module.exports = function(){
    this.ReadSettings = Read;
}

function Read(){
    try{
        console.log("Reading settings.json")
        var fs = require("fs");
        var settings_txt = fs.readFileSync("settings.json");
        var settings = JSON.parse(settings_txt);
        console.log("Done")

        return settings;
    }catch(err){
        console.log("Error: couldn't read settings.json. make sure its there and valid");
        return null;
    }
}
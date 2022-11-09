exports.GetRandomPort =function(min,max){
        var port = randomIntFromInterval(min,max);
        // console.log("min:"+min+", max:"+max+" = "+port);
        return port;
};


function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
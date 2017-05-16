'use strict';

// Requirements and dependencies declarations
const five = require('johnny-five');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

// Initializing LED and motion sensor variables
let led = null;
let motion = null;
let timeGap = 0;

// File resource pointers
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/index.html')
});

//Boolean for motion sensor switch
var motionSensorSwitch = false, ledSwitch = false;
var DOT = 1; // adjusts the time sensitivity between words and chars 
var signalArray = []; // array to store signals
var WORDGAP = 7000 * DOT; // global vars for word and char gaps
var CHARGAP = 3000 * DOT;


var morseCharacterToEncodingTable = { // morse code table
        'A': 'SL',
        'B': 'LSSS',
        'C': 'LSLS',
        'D': 'LSS',
        'E': 'S',
        'F': 'SSLS',
        'G': 'LLS',
        'H': 'SSSS',
        'I': 'SS',
        'J': 'SLLL',
        'K': 'LSL',
        'L': 'SLSS',
        'M': 'LL',
        'N': 'LS',
        'O': 'LLL',
        'P': 'SLLS',
        'Q': 'LLSL',
        'R': 'SLS',
        'S': 'SSS',
        'T': 'L',
        'U': 'SSL',
        'V': 'SSSL',
        'W': 'SLL',
        'X': 'LSSL',
        'Y': 'LSLL',
        'Z': 'LLSS',
        'SK': 'LLSSLL'
};


function beginMotion() {
    if (motionSensorSwitch) {
            // console.log("Motion detected");
            io.emit("motion:start");
    }
    if (ledSwitch) {
        led.on();
    }
}

function getCharacter (signal) { // gets a character from the morse code table from a string of signals
    if (signal.length == 0) { // check for a signal
        return null;
    }
    else {
        var keys = Object.keys( morseCharacterToEncodingTable ); // get dictionary key indices
        for (var i = 0; i <Object.keys(morseCharacterToEncodingTable).length; i++) { // check for a match
            if (signal == morseCharacterToEncodingTable[keys[i]]) {
                return keys[i];
            }
        }
        return null;
    }
}

function decode (events) { // decodes signals into a message
    var build = [], message = [], word =[], char; //define vars
    for (var i = 0; i < events.length; i++) { // loop while there are still signals to process
        if (events[i].gap >= WORDGAP) { // words over here
            char = getCharacter(build.join("")); // get character
            if (char == null) word.push("null"); // null characters
            else {word.push(char);} // push char to word array
            message.push(word.join("")); // push word array to msg array
            build = [], word = []; // clear build and word arrays
            if (message.length != 0) message.push(" "); // if not the first word, add a space to the message
        }
        else if (events[i].gap >= CHARGAP) { // letters here
            char = getCharacter(build.join("")); // get character
            if (char == "SK") { // if receive end of message, exit early
                message.push(word.join(""));
                return message; 
            }
            if (build.length != 0) word.push(char); // if build array is not empty
            build = [];
        }
        build.push(events[i].signal); // every iteration adds the current signal to the build array
        if (i == events.length -1) { // if at the end of the signals
            if (build.length != 0) { // computes remaining chars into the last letter
                char = getCharacter(build.join(""))
                if (char == 'SK') { // SK read
                    message.push(word.join("")); //early exit
                    return message;
                }
                else if (char != null)  word.push(char);
                else word.push("null");
            }
            if ( word.length != 0) { // if there are remainining words in the word array
                message.push(word.join("")); // push the word to message array
            }
        }
    }
    return message; // returns the message
}

//Arduino board connection
var board = new five.Board();  
board.on("ready", function() {  
    console.log('Arduino connected');
    // Declaring pins used on the board
    led = new five.Led(13);
    motion = new five.Motion(7);
    led.off();

    motion.on("calibrated", function() {
        console.log("Motion sensor calibrated")
    });

    motion.on("motionstart", function() {
        // if (motionSensorSwitch) {
        //     console.log("Motion detected");
        //     io.emit("motion:start");
        // }
        // if (ledSwitch) {
        //     led.on();
        // }
        beginMotion();
    });

    motion.on("motionend", function() {
        if (motionSensorSwitch) {
            // console.log("Motion ended");
            io.emit("motion:end");
        }
        if (!motionSensorSwitch && ledSwitch) {
            led.on();
        }
        else if (ledSwitch) {
            led.off();
        }
    });
});

io.on('connection', function (client) {
    client.on('join', function(handshake) {
        // console.log(handshake);
        console.log("Client connected");
        motionSensorSwitch = false;
        ledSwitch = false;
    });
    client.on('led:on', function (data) {
        ledSwitch = true;
        if (motionSensorSwitch && motion.detectedMotion){
            // if (motion.detectedMotion) {
            // led.on();
            // }
            led.on();
        }
        else if (!motionSensorSwitch) {
            led.on();
        }
        // console.log(motion.detectedMotion);
        
        console.log('LED ON RECEIVED');
    });
 
    client.on('led:off', function (data) {
        ledSwitch = false;
        led.off();
        console.log('LED OFF RECEIVED');
    });

    client.on('motion:on', function(data) {
        console.log("MOTION SENSOR ON RECEIVED");
        motionSensorSwitch = true;
        timeGap = new Date().getTime() - timeGap;
        if (motion.detectedMotion) {
            beginMotion();
        }
    });

    client.on('motion:off', function(data) {
        console.log("MOTION SENSOR OFF RECEIVED");
        if (ledSwitch) {
            led.on();
        }
        io.emit('motion:end');
        motionSensorSwitch = false;
        if (signalArray.length != 0) {
            var decodedMsg = decode(signalArray);
            console.log("hahaha");
            console.log(decodedMsg);
            io.emit('messageDecoded', {decodedMsg});
        }
    });
    client.on('eventUpdate',function(data) {
        signalArray.push({signal:data.motionType, gap:parseInt(data.timeStamp)});
        console.log(signalArray);
    });
}); 



// Declare port
const port = process.env.PORT || 3000;

server.listen(port);
console.log(`Server listening on http://localhost:${port}`);

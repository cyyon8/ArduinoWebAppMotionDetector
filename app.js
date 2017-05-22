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



// File resource pointers
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/index.html')
});

//Boolean for motion sensor switch
var motionSensorSwitch = false, ledSwitch = false;
var dot = 1.5; // adjusts the time sensitivity between words and chars 
var signalArray = []; // array to store signals
var WORDGAP = 7000 * dot; // global vars for word and char gaps
var CHARGAP = 3000 * dot;
var SkRecv = 0; // whether the SK prosign has been received
var timeGap = 0; // time gap between current and previous signal event
var timeGapOffset = 0; // offset for the time gap


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
        'SK': 'SSSLSL',
        '1': 'SLLLL',
        '2': 'SSLLL',
        '3': 'SSSLL',
        '4': 'SSSSL',
        '5': 'SSSSS',
        '6': 'LSSSS',
        '7': 'LLSSS',
        '8': 'LLLSS',
        '9': 'LLLLS',
        '0': 'LLLLL',
        '.': 'SLSLSL',
        ',': 'LLSSLL',
        '?': 'SSLLSS',
        "'": 'LSSSSL',
        '!': 'LSLSLL',
        '/': 'LSSLS',
        '(': 'LSLLS',
        ')': 'LSLLSL',
        '&': 'SLSSS',
        ':': 'LLLSSS',
        ';': 'LSLSLS',
        '=': 'LSSSL',
        '+': 'SLSLS',
        '-': 'LSSSSL',
        '_': 'SSLLSL',
        '"': 'SLSSLS',
        '$': 'SSSLSSL',
        '@': 'SLLSLS'
};


function beginMotion() {
    if (signalArray.length == 0) { // adjust offset for the first signal
        timeGapOffset = new Date().getTime();
        timeGap = 0; 
    } else { // get new time gap
        timeGap = new Date().getTime() - timeGap - timeGapOffset; // get new time gap
    }
    if (motionSensorSwitch) {
            // console.log("Motion detected");
            io.emit("motion:start"); // initiate a motion starting in client side
    }
    if (ledSwitch) {
        led.on();
    }
}

//User story 6b
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
        if (events[i].gap < 0) { // handle invalid time gaps
            return "Error: Signal interval time is not positive.";
        }
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
                message.push('SK')
                //User story 6a
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
                    message.push('SK');
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

    //User story 1a
    motion.on("calibrated", function() {
        console.log("Motion sensor calibrated")
    });
    //User story 1b
    motion.on("motionstart", function() {
        beginMotion(); // initiate the beginning of a motion detection
    });

    motion.on("motionend", function() {
        if (motionSensorSwitch) { // if motion switch is on
            io.emit("motion:end"); // initiate a motion ending
        }
        if (!motionSensorSwitch && ledSwitch) { // keep led on if led switch is on
            led.on();
        }
        else if (ledSwitch) { // turn led off otherwise
            led.off();
        }
    });
});

io.on('connection', function (client) {
    client.on('join', function(handshake) {
        console.log("Client connected");
        motionSensorSwitch = false;
        ledSwitch = false;
    });
    client.on('led:on', function (data) { // led switched on from client side
        ledSwitch = true; 
        if (motionSensorSwitch && motion.detectedMotion){ // if currently detecting a motion
            led.on(); // switch led on
        }
        else if (!motionSensorSwitch) { // switch on if not detecting a motion
            led.on();
        }        
        console.log('LED ON RECEIVED');
    });
 
    client.on('led:off', function (data) { // led switched off from client side
        ledSwitch = false;
        led.off(); // switch off led
        console.log('LED OFF RECEIVED');
    });

    client.on('motion:on', function(data) { // motion switched on from client side
        console.log("MOTION SENSOR ON RECEIVED");
        motionSensorSwitch = true;
        // timeGap = new Date().getTime() - timeGap; // get new time gap
        if (motion.detectedMotion) {
            beginMotion(); // initiate a motion detection sequence if a motion is detected
        }
    });

    // motion switched off from client side
    client.on('motion:off', function(data) {
        console.log(signalArray);
        console.log("MOTION SENSOR OFF RECEIVED");
        if (ledSwitch) {
            led.on();
        }
        // initiate motion end sequence in case any motion is currently being detected
        io.emit('motion:end');
        motionSensorSwitch = false;
    });

    // an event needs to be updated
    client.on('eventUpdate',function(data) {
        // signalArray.push({signal:data.motionType, gap:parseInt(data.timeStamp)});
        signalArray.push({signal:data.motionType, gap: timeGap});
        timeGap = new Date().getTime() - timeGapOffset;
        
        console.log(signalArray);
        if (signalArray.length != 0) { // if there are signals
            var decodedMsg = decode(signalArray); // decode signals
            console.log(decodedMsg);
            io.emit('messageDecoded', {decodedMsg}); // let client side know that there is a decoded message
        }
    });

    client.on('resetDb', function(data) {
        console.log('Database reset.')
        signalArray = [];
    });
}); 



// Declare port
//User story 5a
const port = process.env.PORT || 3000;

server.listen(port);
console.log(`Server listening on http://localhost:${port}`);

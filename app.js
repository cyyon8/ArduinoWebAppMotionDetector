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

function beginMotion() {
    if (motionSensorSwitch) {
            // console.log("Motion detected");
            io.emit("motion:start");
    }
    if (ledSwitch) {
        led.on();
    }
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
    });
}); 

// Declare port
const port = process.env.PORT || 3000;

server.listen(port);
console.log(`Server listening on http://localhost:${port}`);

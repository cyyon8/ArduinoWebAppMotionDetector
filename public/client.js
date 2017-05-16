(function() {
    // Get default URL
    var socket = io.connect(window.location.hostname + ':' + 3000);

    // Initialize variables linked to html components
    var led = document.getElementById('led');
    var motionSensor = document.getElementById('motionSensor');
    
    // Initialize variables: d - Date object placeholder, timeStamp to get current time, motionDetecting
    // to show the status of the motion sensor and LONG which is the minimum duration for a long motion
    var timeStamp, motionDetecting = false;
    var LONG = 8.0;

    //User story 4
    function getMotionType(time) {
        // returns "L" if motion is a long motion, "S" otherwise
        if (time > LONG) {
            return "L";
        }
        else {
            return "S";
        }
    }
	
	function ledControl() {
		if (document.getElementById('led').checked) {
			// console.log('LED switch on');
            if (document.getElementById('motionSensor').checked) {
                consoleMessageUpdate("LED switched on, pairing with motion sensor");    
            }
            else {
                consoleMessageUpdate("LED switched on");
            }
			socket.emit('led:on');
            // e.preventDefault();

		} else if (!document.getElementById('led'.checked)) {
			// console.log('LED switch off');
            consoleMessageUpdate("LED switched off");
			socket.emit('led:off');
		}
	}
	
	function motionSensorControl() {
		if (document.getElementById('motionSensor').checked) {
			// console.log('Motion Sensor switch on');
            consoleMessageUpdate("Motion sensor switched on");
			socket.emit('motion:on');
		} else if (!document.getElementById('motionSensor'.checked)) {
			// console.log('Motion Sensor switch off');
            consoleMessageUpdate("Motion sensor switched off");
            socket.emit('motion:off');
		}
	}

     //User story 3a, 3b
    function motionCountUpdate(longMotion = false) {
	//User story 5a
        document.getElementById("totalMotions").innerHTML = Number(document.getElementById("totalMotions").innerHTML) + 1;
        if (longMotion) {
            document.getElementById("totalLongMotions").innerHTML = Number(document.getElementById("totalLongMotions").innerHTML) + 1;
        }
        else {
            document.getElementById("totalShortMotions").innerHTML = Number(document.getElementById("totalShortMotions").innerHTML) + 1;
        }
    }

    function consoleMessageUpdate(message) {
        document.getElementById("consoleMessage").innerHTML = message;
    }

    led.addEventListener('change', ledControl.bind());
    motionSensor.addEventListener('change', motionSensorControl.bind());

    socket.on('connect', function(data) {
        socket.emit('join', 'Client is connected!');
    });

    //User story 2a, 2b, 5b
    socket.on('motion:start', function(data)  {
        motionDetecting = true;
        timeStamp = new Date().getTime();
        consoleMessageUpdate("New motion detected");
    });
    
    socket.on('motion:end', function(data) {
        if (motionDetecting) {
            timeStamp = (new Date().getTime() - timeStamp);
            // Checks for a long motion
            var motionType = getMotionType(timeStamp/1000);
            // Long motions after motions greater than the value of LONG in seconds
            motionCountUpdate((motionType == "L") ? true : false);
            consoleMessageUpdate("Motion ended, time was " + (timeStamp/1000).toFixed(2).toString() + "seconds");
            motionDetecting = false;
            socket.emit('eventUpdate', {motionType, timeStamp});
        }
    });
}());

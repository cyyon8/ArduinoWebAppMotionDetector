# assignment-5-team-62
# Morse code interpreter

The morse code interpreter uses an Arduino Microcontroller and a pip motion sensor to capture motions and interpret chains of motions into letters, numbers and puncuation mark based on the morse code defined alphabet. It features:

  - Ability to interpret motions into meaningful messages
  - View printed messages through a web interface
  - Ability to end transmissions, turn sensor and LED on or off through an easy to use web interface  
  - Follows the standard morse code alphabet
  - Real time server-client interaction

### Dependencies & Tech

The Arduino Web Controller uses a number of different packages and libraries in order to function properly:

 - [socket.io](https://socket.io/) - enables real-time bidirectional event based communication between the server and the microcontroller, the version used is 1.7.3.
 - [Express](https://expressjs.com/) - fast node.js network app framework, the version used 4.15.2.
 - [johnny-five](http://johnny-five.io/) - Javascript Robotics and IoT platform utilizing node.js, version 0.10.6
 - [Node.js](https://nodejs.org/en/) - lightweight and efficient Javascript runtime, version 7.5.0
 
For testing:
 - [mocha](https://mochajs.org/) a feature-rich JavaScript test framework , version 3.4.1
 - [chai](http://chaijs.com/) - a BDD / TDD assertion library paired with any javascript testing framework, version 4.0.0

An Arduino microcontroller connected to your computer is also required. Be sure to have uploaded the StandardFirmataPlus program into the board before you run the web server.

Refer to the **Getting Started** section below for a step-by-step walk through on how to get your web server set up and running.

## Getting Started

### Installation

The Arduino Web Controller requires [Node.js](https://nodejs.org/en/), [johnny-five](http://johnny-five.io/), [Express](https://expressjs.com/) and [socket.io](https://socket.io/) to run. It is recommended that you do include all of the packages excluding Node.js in one single directory. For simplicity's sake we assume that the user is using a Ubuntu bassed Linux distribution.

Install Node.js

```sh
$ sudo apt-get install -y nodejs
```
Or you can follow the instructions [here](https://nodejs.org/en/download/package-manager/) to install it.

Install the other dependencies. 

```sh
$ npm install express
$ npm install socket.io
$ npm install johnny-five
$ npm install mocha -g
$ npm install chai --save-dev
```
Note: mocha and chai are required to run the test cases only.

### Setting Up The Arduino Uno
The minimum requirements for the Arduino is 
1. 1 PIR motion sensor
2. 1 Arduino Uno
3. 1 LED light
4. 3 jumper cables

For the PIR motion sensor, connect the VCC pin the 5V pin port, the GND pin to a GND port and the OUT pin to pin number 7 on the Arduino Uno. 
[Here](http://johnny-five.io/examples/motion/)'s an example of setting up the motion sensor with the board.

Connect the LED to a GND pin and pin number 13. Once the board has been set up, upload the StandardFirmataPlus.ino program into the board with the Arduino IDE.
[Here](http://johnny-five.io/examples/led/)'s an example of how to set up the LED.

Your board is now ready to go!
### Getting the server running
Once you have all the dependencies installed and the board set up, run the main.js file.
```sh
$ node app.js
```
If you are running this on a local machine, connect to http://localhost:3000 and you should see the control panel for the microcontroller.

### Running unit tests
Again, once all dependencies are installed including mocha and chai you will need to ensure you are currently in the unittest directory. To run the first unit test:
```sh
$ mocha unitTest1.js
```
And to run the second unit test:
```sh
$ mocha unitTest2.js
```
The board does not to be connected to perform these unit tests.

### Features and functions

####Morse Code Interpreter
The main functionality is the ability to decode motions into meaningful messages through short and long motions. A long motion is defined as any motion greater than or equal to 8 seconds and a short motion is below 8 seconds. 

```js
'A': 'SL'
'B':'LSSS'
'C':'LSLS'
...
'Z':'LLSS'
'SK': 'SSSLSL' #end of transmission
```

From each transmission of the motion to the client side, the system will recognize a BLANK seconds gap as a word is still being produced, and a BLANK2 gap is to indicate that a word has been sent. From this the system will print out when ever a letter has been decoded and/or space between words. 

The web interface allows you turn off transmission, which will cause the system to stop getting information from the server. It also allows you turn off the LED and Motion sensor.

Turn the LED switch on to switch the LED on. 
The LED has 2 modes:
 - The first mode is *only* when the LED is switched on. In this case the LED switch behaves as a regular on/off switch and will turn the LED on or off regardless of any motions detected.
 - The second mode is when *both* the motion sensor and the LED are switched on. This time the LED will only flash when a motion is detected.

Turn the motion sensor switch on to enable motion detection. When a motion is detected, the counters will increase. A short motion is defined as a motion lasting under 8 seconds, and motions above 8 seconds are considered long motions. When the LED is switched on, the the LED will flash whenever a motion is detected. Motions detected when the LED is switched off will still update the counters but the LED will not flash. 

When the motion sensor is turned off whilst detecting a motion, it will end the current motion and the controller will calculate the motion's duration based on the time it started to when the motion sensor is switched off.

Switching the motion sensor on is equivalent to starting the signal recording session. When you turn the motion sensor switch off, the program will take whatever signals that are currently recorded from the current session and will proceed to decode the message. After that the message will be displayed on the user interface and the array that stores the signals will be emptied.

### Known Bugs

Because the motion detector will constantly detect motions when connected to the Arduino, there will be times when a motion is already detected even before turning the motion sensor switch on. Turning the motion sensor on in the middle of this will cause the controller to register the start time of the motion as when the switch was turned on, not when the actual motion began. 

Turning the motion sensor off in the middle of a detection will cause the controller to tabulate its duration based on when the motion started until the switch was turned off. Turning the switch on again immediately after might cause the program to register the single long motion as 2 motions.

The motion detector might also not be able to accurately detect motion from the sensor. We have tried stimulating the motion sensor for about 10 seconds uninterrupted, but there are still times when the motion sensor would not detect anything, or end it's current detection session.

### Authors
 - James Lee Zhong Kein - https://github.com/jamsawamsa
 - Daniel Zambetto - https://github.com/djzam3

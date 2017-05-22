function Decoder(string, dot) {
    this._message = string;
    this.morseCharacterToEncodingTable = { // morse code table
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
    this._dot = dot;
    this._WORDGAP = 7000 * this._dot;
    this._CHARGAP = 3000 * this._dot;
}
// global vars for a word and character gap


Decoder.prototype.morseSimulator = function (msg, callback= this.decode) { 
    /* Simulates the signals from a motion detector. Attributed from Nawfal's examples, but 
    adjusted so that the program is not expected to know the time gap between the current signal and
    the next and instead takes the time gap from the current signal and the previous one. */
    // define variables
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
    var INTER_CODE = 1000;
    var INTER_LETTER = 3000;
    var INTER_WORDS = 7000;
    var words = msg.split(" "); // split into words
    // console.log("I got " + words.length + " words.");
    var word = "";
    var codeIndex = 0;
    var letterCode = [];
    var letters = [];
    var ptn;
    var events = [];
    var wordEndFlag = false;
    var letterEndFlag = false;
    var timeGap = INTER_CODE;

    function buildEvents(){ // generates the signal representation of the string
        for (var i = 0; i< words.length; i++) {
            word =words[i]; // get a word
            // console.log(word);
            letters = word.split(""); // split word into array of letters
            for (var j =0 ;j<letters.length;j++){
                letterCode = morseCharacterToEncodingTable[letters[j]].split("") // split the code
                for (var k = 0; k< letterCode.length;k++) {
                    events.push({signal: letterCode[k], gap: timeGap});
                    if  (timeGap != INTER_CODE) { // reset time gap
                        timeGap = INTER_CODE;
                    }
                    if (wordEndFlag) { // reset the end of word flag
                        wordEndFlag = false;
                    }
                    else if (letterEndFlag) { // reset the end of letter flag
                        letterEndFlag = false;
                    }
                    if (k === letterCode.length - 1) { // end of a letter
                    letterEndFlag = true;
                    timeGap = INTER_LETTER;
                    }
                }
                if (j === letters.length - 1) { // end of a word
                    wordEndFlag = true;
                    timeGap = INTER_WORDS;
                }
            }
        }
        // insert SK at the end
        letterCode =morseCharacterToEncodingTable['SK'].split(""); // splits the code
        for (k = 0; k < letterCode.length; k++) {
            if (k == 0) {
                events.push({signal: letterCode[k], gap: INTER_LETTER});
            }
            else {
                events.push({signal: letterCode[k], gap: INTER_CODE});
            }
        }
    }

    function loop() { // unused, attributed from Nawfal's example
        if (codeIndex === events.length) {
            clearInterval(ptn);
        }
        else {
            callback(events[codeIndex].signal);
            ptn = setTimeout(loop, events[codeIndex++].gap);
        }
    }

    buildEvents();
    // console.log(events);
    var output = callback(events, INTER_WORDS, INTER_LETTER);
    // console.log("Message decoded is: " + output);
    return output;
}

function getCharacter (signal) { // gets a character from the morse code table from a string of signals
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
    // console.log(signal);
    if (signal.length == 0) { // check for a signal
        return null;
    }
    else {
        var keys = Object.keys( morseCharacterToEncodingTable ); // get dictionary key indices
        for (var i = 0; i <Object.keys(morseCharacterToEncodingTable).length; i++) { // check for a match
            if (signal == morseCharacterToEncodingTable[keys[i]]) {
                if (morseCharacterToEncodingTable[keys[i]] == 'SK'){
                    // console.log("ACHOO MOFO");
                }
                return keys[i];
            }
        }
        return null;
    }
}

Decoder.prototype.decode = function (events, _WORDGAP, _CHARGAP) { // decodes signals into a message
    var build = [], message = [], word =[], char; //define vars
    for (var i = 0; i < events.length; i++) { // loop while there are still signals to process
        if (events[i].gap < 0) {
            return "Error: Signal interval time is not positive.";
        }
        if (events[i].gap >= _WORDGAP) { // words over here
            // console.log("wordgap");
            char = getCharacter(build.join("")); // get character
            if (char == null) word.push("null"); // null characters
            else {word.push(char);} // push char to word array
            message.push(word.join("")); // push word array to msg array
            build = [], word = []; // clear build and word arrays
            if (message.length != 0) message.push(" "); // if not the first word, add a space to the message
        }
        else if (events[i].gap >= _CHARGAP) { // letters here
            // console.log("chargap");
            char = getCharacter(build.join("")); // get character
            if (char == "SK") { // if receive end of message, exit early
                message.push(word.join(""));
                return message.join(""); // returns the message
            }
            if (build.length != 0) word.push(char); // if build array is not empty
            build = [];
        }
        build.push(events[i].signal); // every iteration adds the current signal to the build array
        // console.log(build);
        // console.log("reggap", _CHARGAP, _WORDGAP);
        if (i == events.length -1) { // if at the end of the signals
            if (build.length != 0) { // computes remaining chars into the last letter
                char = getCharacter(build.join(""))
                if (char == 'SK') { // SK read
                    message.push(word.join("")); //early exit
                    return message.join(""); // returns the message
                }
                else if (char != null)  word.push(char);
                else word.push("null");
            }
            if ( word.length != 0) { // if there are remainining words in the word array
                message.push(word.join("")); // push the word to message array
            }
        }
    }
    return message.join(""); // returns the message
}


module.exports = Decoder;
// morseSimulator("GIFF HD PLS", decode);
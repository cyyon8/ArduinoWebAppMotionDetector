var chai = require('chai');
var expect = chai.expect;

var Decoder = require('./decoder');

describe('Decoder', function(){
    // test cases for the decoding signal functions
	it('decode the message "THIS IS A HOAX" accurately, regular input',
	function(){
        var msg = "THIS IS A HOAX";
		var decoder = new Decoder(msg, 1);
		expect(decoder.morseSimulator(msg)).to.equal(msg);
	});
    it('Detecting negative gap times and exiting early',
	function(){
		var decoder = new Decoder("", 1);
        var signal = [{ signal: "L", gap: -1}]
		expect(decoder.decode(signal, 7000, 3000)).to.equal("Error: Signal interval time is not positive.");
	});
    it('Returns null when a signal does not match any entries in the morse code table',
	function(){
		var decoder = new Decoder("", 1);
        var signal = [{ signal: "L", gap: 1},{ signal: "L", gap: 1},{ signal: "L", gap: 1},{ signal: "L", gap: 1},{ signal: "L", gap: 1}]
		expect(decoder.decode(signal, 7000, 3000)).to.equal("null");
	});
    
  it('Exits early the moment an SK is detected and returns the message that has been decoded so far',
	function(){
		var decoder = new Decoder("", 1);
        var signal =   [{ signal: 'S', gap: 1000 }, //  hardcoded msg which decodes to 'A' 'SK' 'SK' 'A'
                        { signal: 'L', gap: 1000 },
                        { signal: 'L', gap: 3000 },
                        { signal: 'L', gap: 1000 },
                        { signal: 'S', gap: 1000 },
                        { signal: 'S', gap: 1000 },
                        { signal: 'L', gap: 1000 },
                        { signal: 'L', gap: 1000 },
                        { signal: 'L', gap: 3000 },
                        { signal: 'L', gap: 1000 },
                        { signal: 'S', gap: 1000 },
                        { signal: 'S', gap: 1000 },
                        { signal: 'L', gap: 1000 },
                        { signal: 'L', gap: 1000 },
                        { signal: 'S', gap: 3000 },
                        { signal: 'L', gap: 1000 }];
		expect(decoder.decode(signal, 7000, 3000)).to.equal("A");
	});
});

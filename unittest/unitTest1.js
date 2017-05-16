var chai = require('chai');
var expect = chai.expect;

var Motion = require('./motion');

describe('Motion', function(){

	it('return true if time > 8 seconds, indicating a long motion',
	function(){
		var motion = new Motion(9);
		expect(motion.getMotionType()).to.equal('L');
	});

	it('return false if length is < 8 seconds, indicating a short motion',
	function(){
		var motion = new Motion(2);
		expect(motion.getMotionType()).to.equal('S');
	});
	it('return -1 if length is < 0 seconds, indicating an invalid time',
	function(){
		var motion = new Motion(-1);
		expect(motion.getMotionType()).to.equal(-1);
	});
});

var chai = require('chai');
var expect = chai.expect;

var Motion = require('./motion');

describe('Motion', function(){

	it('return true if length > 8000, indicating a long motion',
	function(){
		this.timeout(10000);
		
		var motion = new Motion(9000);
		expect(motion.getMotion()).to.equal(true);
	});

	it('return false if length is < 8000, indicating a short motion',
	function(){
		this.timeout(10000);
		var motion = new Motion(2000);
		expect(motion.getMotion()).to.equal(false);
	});

	it('return -1 if no motion detected',
	function(){
		var motion = new Motion(0);
		expect(motion.getMotion()).to.equal(-1);
	});
});

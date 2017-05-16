//Constructor
function Motion(time){
	this._ms = time;
}

//Calculate long motion
Motion.prototype.getMotion = function(){
	const LONG_MOTION = 8000;
	if (this._ms > 0){
		var timeStamp; //motion start and end time
		timeStamp = new Date().getTime();

		var start = new Date().getTime();
		var end = start;
		while(end < start + this._ms) { //Wait for time specified
			end = new Date().getTime();
		}
		timeStamp = new Date().getTime() - timeStamp;
		/*false indicates short motion*/
		var longMotion = ( timeStamp >= LONG_MOTION ); 
		return longMotion;
	}
	return -1; //no motion
};

module.exports = Motion;

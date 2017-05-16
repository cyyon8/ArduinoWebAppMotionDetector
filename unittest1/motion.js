//Constructor
function Motion(time){
	this._timeStamp = time;
}

//Calculate long motion
Motion.prototype.getMotionType = function(){
	const LONG_MOTION = 8000;
	if (this._timeStamp > LONG_MOTION) {
            return "L";
        }
        else {
            return "S";
        }
};

module.exports = Motion;

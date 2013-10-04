//#requires mathlib

var SIN45 = Math.sin(Math.PI/4);

function calculateMapY(hf, ix, iy,hint){

	//var c = 0;
	var denom = 2;
	var dir = 1;
	var worldY = hint;
	while(true){
		var v = hf(ix,worldY)//*100;
		var screenY = -v + worldY*SIN45;
		
		var worldDelta = (iy - screenY)/denom;
		if(Math.abs(iy - screenY) < 0.5){
			return worldY;
		}

		var curDir = worldDelta > 0 ? 1 : -1;
		if(dir !== curDir){
			dir = curDir;
			denom *= 2;
		}
		if(denom > 1024) return worldY;
		worldY += worldDelta;
		//++c;
	}
	
}

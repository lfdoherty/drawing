
var lineFill;
var lineFillIsometric;

(function(){

/*
Draws lines to fill the box given, using lines parallel to the vector given in dx, dy.  

Calls startLineCb(x,y) at the beginning of each line, and calls iterateLineCb(x,y) for 
each pixel.  Lines will always start at an edge of the box and end at an edge of the box.
*/
lineFill = function(startLineCb, iterateLineCb, sx, sy, bx, by, dx, dy){

	if(dx > dy){
		dy = dy / mag2(dx,dy);
		lineFillX(startLineCb, iterateLineCb, sx, sy, bx, by, dy);
	}else{
		dx = dx / mag2(dx,dy);
		lineFillY(startLineCb, iterateLineCb, sx, sy, bx, by, dx);
	}
}

function lineFillX(startLineCb, iterateLineCb, sx, sy, bx, by, dy){

	var minY = dy > 0 ? sy - Math.ceil((by-sy)*dy) : sy;
	var maxY = dy > 0 ? by : by - Math.floor((by-sy)*dy);
	
	for(var py=minY;py<maxY;++py){
				
		var y = py;
		var x=sx;
		
		while(y<sy || y>=by){
			y += dy;
			++x;
		}

		startLineCb(x,y);

		while(x<bx){
			
			iterateLineCb(x,y);

			y += dy;
			++x;
		}
	}
}

function lineFillY(startLineCb, iterateLineCb, sx, sy, bx, by, dx){

	var minX = dx > 0 ? sx - Math.ceil((bx-sx)*dx) : sx;
	var maxX = dx > 0 ? bx : bx - Math.floor((bx-sx)*dx);
	
	for(var px=minX;px<maxX;++px){
				
		var x = px;
		var y=sy;
		
		while(x<sx || x>=bx){
			x += dx;
			++y;
		}

		startLineCb(x,y);

		while(y<by){
			
			iterateLineCb(x,y);

			x += dx;
			++y;
		}
	}
}

var SIN45 = Math.sin(Math.PI/4);

/*

Draws lines in world space whose resolution (and pixel position) is determined by the resolution of screenspace,
except where that resolution is less than 1 unit of world space.
Writes the lines as screen pixels to the screenPixelCb, providing as well the value returned by iterateLineCb.

Draws lines in screen space, but checks the dy in world space, and draws additional interpolated pixels in between 
if it is greater than 1.

*/
lineFillIsometric = function(hf, screenPixelCb, startLineCb, iterateLineCb, sx, sy, bx, by, dx, dy){

	if(arguments.length !== 10) throw 'should be 10 arguments';
	//first, translate the dx,dy vector into screen space
	dy = dy*SIN45;

	if(dx > dy){
		dy = dy / mag2(dx,dy);
		console.log('doing isometric line fill - x - dy: ' + dy);
		lineFillIsometricX(hf, screenPixelCb, startLineCb, iterateLineCb, sx, sy, bx, by, dy);
	}else{
		dx = dx / mag2(dx,dy);
		console.log('doing isometric line fill - y - dx: ' + dy);
		lineFillIsometricY(hf, screenPixelCb, startLineCb, iterateLineCb, sx, sy, bx, by, dx);
	}
}

function interpolatePointsX(x, worldY, newWorldY, iterateLineCb){
	var changeY = newWorldY-worldY;
	var manyInterpolatedPoints = Math.ceil(changeY);
	for(var i=0;i<manyInterpolatedPoints;++i){
		var t = i/manyInterpolatedPoints;
		var interpolatedY = worldY + changeY*t;
		var interpolatedX = (x-1)+t;
		
		iterateLineCb(interpolatedX,interpolatedY);
	}
}

var ceil = Math.ceil;
var floor = Math.floor;
var abs = Math.abs;
function lineFillIsometricX(hf, screenPixelCb, startLineCb, iterateLineCb, sx, sy, bx, by, dy){

	var minY = dy > 0 ? sy - ceil((by-sy)*dy) : sy;
	var maxY = dy > 0 ? by : by - floor((by-sy)*dy);
	
	//console.log(minY + ' ' + maxY);
	//console.log(sx + ' ' + sy + ' ' + bx + ' ' + by);
	
	for(var py=minY;py<maxY;++py){
				
		var y = py;
		var x=sx;
		
		while(y<sy || y>=by){
			y += dy;
			++x;
		}

		var worldY = 0;
		worldY = calculateMapY(hf, x, y, worldY);

		startLineCb(x,worldY);

		var prog = 100*(py/(maxY-minY));
		if(prog % 10 === 0){
			console.log('progress ' + prog);
		}
		while(x<bx){
		
			
			var newWorldY = calculateMapY(hf, x, y, worldY);
			
			if(newWorldY - worldY > 1){
				interpolatePointsX(x, worldY, newWorldY, iterateLineCb)
			}
			
			worldY = newWorldY;
			var result = iterateLineCb(x,worldY);
			//if(Math.random() > .999) console.log('test');
			screenPixelCb(x, floor(y), result);

			y += dy;
			++x;
		}
	}
}

function calculateMapY(hf, ix, iy,hint){

	//var c = 0;
	var denom = 2;
	var dir = 1;
	var worldY = hint;
	if(isNaN(hint)) throw 'hint NaN';
	while(true){
		var v = hf(ix,worldY);
		if(isNaN(v)) throw 'NaN v';
		var screenY = -v + worldY*SIN45;
		
		if(abs(iy - screenY) < 0.5){
			return worldY;
		}
		
		var worldDelta = (iy - screenY)/denom;
		if(isNaN(worldDelta)) throw 'NaN worldDelta';
		worldY += worldDelta;
		
		//if(c > 200) console.log(worldDelta + ' ' + iy + ' ' + screenY + ' ' + (iy-screenY) + ' ' + denom + ' ' + worldY);
		//if(c > 210) throw 'wtf';
		var curDir = worldDelta > 0 ? 1 : -1;
		if(dir !== curDir){
			if(denom >= 256) return worldY;//if we're going back and forth in tiny increments, just assume we're close enough
			dir = curDir;
			denom *= 2;
		}
		//++c;
	}
	
}


})();

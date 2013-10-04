"use strict";
/*

Xiaolin Wu's line algorithm is an algorithm for line antialiasing, which was presented in 
the article An Efficient Antialiasing Technique in the July 1991 issue of Computer 
Graphics, as well as in the article Fast Antialiasing in the June 1992 issue of Dr. Dobb's Journal.

*/


function distance(x,y){return Math.sqrt(x*x+y*y);}

function drawLineAliased(x0, y0, x1, y1,pf){

	x0 = Math.floor(x0);
	x1 = Math.floor(x1);
	y0 = Math.floor(y0);
	y1 = Math.floor(y1);

	var dx = Math.abs(x1-x0)
	var dy = Math.abs(y1-y0) 
	
	var sx, sy;
	if(x0 < x1)
		sx = 1 
	else 
		sx = -1
		
	if(y0 < y1 )
		sy = 1 
	else 
		sy = -1
		
	var err = dx-dy

	while(true){
		
		pf(x0,y0)
		
		if(x0 === x1 && y0 === y1) break;
		
		var e2 = 2*err
		if(e2 > -dy) {
			err = err - dy
			x0 = x0 + sx
		}
		if(e2 < dx) {
			err = err + dx
			y0 = y0 + sy 
		}
	}
}


function drawLineThick(x0, y0, x1, y1,pf){

	x0 = Math.floor(x0);
	x1 = Math.floor(x1);
	y0 = Math.floor(y0);
	y1 = Math.floor(y1);

	var dx = Math.abs(x1-x0)
	var dy = Math.abs(y1-y0) 
	
	var sx, sy;
	if(x0 < x1)
		sx = 1 
	else 
		sx = -1
		
	if(y0 < y1 )
		sy = 1 
	else 
		sy = -1
		
	var err = dx-dy

	while(true){
		
		pf(x0,y0)
		
		if(x0 === x1 && y0 === y1) break;
		
		var e2 = 2*err
		if(e2 > -dy) {
			err = err - dy
			x0 = x0 + sx
		}else if(e2 < dx) {
			err = err + dx
			y0 = y0 + sy 
		}
	}
}

function ipart(x){return Math.floor(x);}
function round(x){return Math.round(x);}
function fpart(x){return x-Math.floor(x);}
function rfpart(x){return 1-fpart(x);}

function drawLineAntialiased(x1,y1,x2,y2,pf){
	var dx = x2 - x1
	var dy = y2 - y1
	if(distance(dx,dy) < 1.0){
		//TODO spread across 4 adjacent pixels
		pf(x1,y1,1.0);
		return;
	}
	var t;
	var plot = pf;
	if(Math.abs(dx) < Math.abs(dy)){
		//swap x1, y1
		t=x1;x1=y1;y1=t;
		//swap x2, y2
		t=x2;x2=y2;y2=t;
		//swap dx, dy
		t=dx;dx=dy;dy=t;
		plot = function(nnx,nny,c){pf(nny,nnx,c);}
	}
	if(x2 < x1){
		//swap x1, x2
		t=x1;x1=x2;x2=t;
		//swap y1, y2
		t=y1;y1=y2;y2=t;
	}
	var gradient = dy / dx;

	// handle first endpoint
	var xend = round(x1)
	var yend = y1 + gradient * (xend - x1)
	var xgap = rfpart(x1 + 0.5)
	var xpxl1 = xend  // this will be used in the main loop
	var ypxl1 = ipart(yend)

	plot(xpxl1, ypxl1, rfpart(yend) * xgap)

	plot(xpxl1, ypxl1 + 1, fpart(yend) * xgap)
	var intery = yend + gradient // first y-intersection for the main loop

	// handle second endpoint
	xend = round (x2)
	yend = y2 + gradient * (xend - x2)
	xgap = fpart(x2 + 0.5)
	var xpxl2 = xend  // this will be used in the main loop
	var ypxl2 = ipart (yend)

	plot (xpxl2, ypxl2, rfpart (yend) * xgap)

	plot (xpxl2, ypxl2 + 1, fpart (yend) * xgap)

	// main loop
	for(var x = xpxl1 + 1; x <= xpxl2 - 1;++x){

		plot (x, ipart (intery), rfpart (intery))

		plot (x, ipart (intery) + 1, fpart (intery))
		intery = intery + gradient
	}
}

function between(ax,ay,bx,by){
	return {
		p: {x:ax,y:ay},
		v:{x:bx-ax,y:by-ay}
	};
}

function extendLine(line,starting,ending){
	var n = {p:{x:line.p.x,y:line.p.y},v:{x:line.v.x,y:line.v.y}};
	
	if(starting){
		n.p.x += starting*n.v.x;
		n.p.y += starting*n.v.y;

		n.v.x -= starting*n.v.x;
		n.v.y -= starting*n.v.y;
	}

	if(ending){
		n.v.x *= ending;
		n.v.y *= ending;
	}
	return n;
}

function extendLineInt(line,starting,ending){
	var n = {p:{x:line.p.x,y:line.p.y},v:{x:line.v.x,y:line.v.y}};
	
	if(starting){
		var dx = starting*n.v.x;
		var dy = starting*n.v.y;
		dx = Math.round(dx);
		dy = Math.round(dy);
		
		n.p.x += dx;
		n.p.y += dy;

		n.v.x -= dx;
		n.v.y -= dy;
	}

	if(ending){
		var dx = (1.0-ending)*n.v.x;
		var dy = (1.0-ending)*n.v.y;
		dx = Math.round(dx);
		dy = Math.round(dy);

		n.v.x += dx;
		n.v.y += dy;
	}
	return n;
}

function intLine(line){
	return {
		p: {
			x: Math.round(line.p.x),
			y: Math.round(line.p.y)
		},
		v: {
			x: Math.round(line.v.x),
			y: Math.round(line.v.y)
		}
	};
}
/*
function ua(a,b){
	return (b.v.x*(a.p.y-b.p.y) - b.v.y*(a.p.x-b.p.x))/ubb(a,b);
}
function ub(a,b){
	return (a.v.x*(a.p.y-b.p.y) - a.p.y*(a.p.x-b.p.x))/ubb(a,b);
}*/
function ubb(a,b){
	return (b.v.y*a.v.x - b.v.x*a.v.y);
}
/*
function linesAreParallel(a, b){
	return Math.abs(ubb(a,b)) < .000001;
}*/

function lineSide(px, py, line){
	return line.v.y*(px - line.p.x) - line.v.x*(py - line.p.y);
}

function linesMightIntersect(a,b){
	var as = lineSide(a.p.x,a.p.y,b);
	var bs = lineSide(a.p.x+a.v.x, a.p.y+a.v.y, b);
	
	return (as < 0 && bs > 0) || (as > 0 && bs < 0);
}

function linesIntersect(a,b){
	var ub = ubb(a,b);
	var uav = (b.v.x*(a.p.y-b.p.y) - b.v.y*(a.p.x-b.p.x))/ub;
	var ubv = (a.v.x*(a.p.y-b.p.y) - a.p.y*(a.p.x-b.p.x))/ub;
	
	if(uav >= 0 && uav <= 1 && ubv >= 0 && ubv <= 1) return true;
}
	

exports.drawLineAliased = drawLineAliased;
exports.drawLineThick = drawLineThick
exports.drawLineAntialiased = drawLineAntialiased
exports.between = between
exports.extendLine = extendLine
exports.extendLineInt = extendLineInt
exports.intLine = intLine

exports.linesMightIntersect = linesMightIntersect
exports.linesIntersect = linesIntersect




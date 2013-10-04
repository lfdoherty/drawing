

var f = Math.floor;
var c = Math.ceil;
var r = Math.round;
var a = Math.abs;

function normalize2(p){//INEF
	var m = mag2(p.x,p.y);
	return {x: p.x/m, y: p.y/m};
}
function normalize3(p){//INEF
	var m = mag3(p.x,p.y,p.z);
	return {x: p.x/m, y: p.y/m, z: p.z/m};
}
function mag2(x,y){
	return Math.sqrt((x*x) + (y*y));
}
function mag3(x,y,z){
	return Math.sqrt((x*x) + (y*y) + (z*z));
}
function rand(n){
	return f(Math.random()*n);
}
function dot2(x,y, qx,qy){
	return (x*qx) + (y*qy);
}
function dot3(x,y,z,qx,qy,qz){
	return (x*qx) +(y*qy) + (z*qz);
}
function sub2(x,y,qx,qy){//INEF
	return {x: x-qx, y: y-qy};
}
function distance2(x,y, qx,qy){
	//var d = sub2(p1, p2);
	var dx = x-qx;
	var dy = y-qy;
	return mag2(dx,dy);
}

function cross(a, b){//INEF
	return {
		x: a.y*b.z - a.z*b.y, 
		y: a.z*b.x - a.x*b.z, 
		z: a.x*b.y - a.y*b.x
		};
}

function normal2(x,y,f,e){//INEF

	var v1 = {x: 0, y: e},
		v2 = {x: e, y: 0};
		
	var h = f(x,y);
	v1.z = f(x, y+e)-h;
	v2.z = f(x+e, y)-h;
	
	var se = e*e;
	
	var a1 = Math.sqrt(se+v1.z*v1.z);
	var a2 = Math.sqrt(se+v2.z*v2.z);
	
	v1.y /= a1;
	v1.z /= a1;

	v2.y /= a2;
	v2.z /= a2;
	
	var n = cross(v1, v2);
	return n;
}

function angle2(x,y, qx,qy){
	var d = mag2(x,y) * mag2(qx,qy);
	return Math.acos(dot2(x,y,qx,qy)/d);
}

function fangle2(x,y, qx,qy){
	var ma = mag2(x,y);
	var mb = mag2(qx,qy);
	var res = Math.atan2(y/ma, x/ma) - Math.atan2(qy/mb, qx/mb);
	if(res < -Math.PI){
		throw 'error';
	}
	return res;
}

function angle3(x,y,z, qx,qy,qz){
	var d = mag3(x,y,z) * mag3(qx,qy,qz);
	return Math.acos(dot3(x,y,z,qx,qy,qz)/d);
}

function int3(t){
	return (3*(t*t)) - (2*(t*t*t));
}

function int6(t){
	var v = (t*t*t)*(t*(t*6-15)+10);
	return v;
}
/*
function sig(t){
	return 1/(1+Math.exp(-t));
}*/
/*
function cubicInterpolate(h, x){
	return h[1] + 0.5 * x*(h[2] - h[0] + x*(2.0*h[0] - 5.0*h[1] + 4.0*h[2] - h[3] + x*(3.0*(h[1] - h[2]) + h[3] - h[0])));
}*/

//takes a point (actually a vector from the center of the height grid), 
//and a 4X4 array of heights (from grid positions around the point) to be interpolated
/*function interpolateBicubic(p, harr){
	
	var narr = [
		cubicInterpolate(harr[0], p.y),
		cubicInterpolate(harr[1], p.y),
		cubicInterpolate(harr[2], p.y),
		cubicInterpolate(harr[3], p.y)
		];
	
	return cubicInterpolate(narr, p.x);	
}*/

var L5 = Math.log(.5);
console.log('.5, 5.0: ' + bias(.5,5.0));
console.log('.5, 50.0: ' + bias(.5,50.0));
console.log('.5, 0: ' + bias(.5,0.0));
console.log('.1, 5.0: ' + bias(.1,5.0));
console.log('.1, 50.0: ' + bias(.1,50.0));
console.log('.1, 0: ' + bias(.1,0.0));
console.log('.9, 5.0: ' + bias(.9,5.0));
console.log('.9, 50.0: ' + bias(.9,50.0));
console.log('.9, 0: ' + bias(.9,0.0));

function bias(p, x){
	var result = Math.pow(x, Math.log(p)/L5);
	if(isNaN(result)){
		
		 throw 'isNan(' + x + ')';
	}
	return result;
}


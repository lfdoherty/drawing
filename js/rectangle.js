"use strict";

function Rectangle(x,y,w,h){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}
exports.Rectangle = Rectangle

Rectangle.prototype.area = function(){
	return this.w*this.h;
}
function squishLineByPoint(line,dx,dy){
	line.p.x += dx;
	line.p.y += dy;
	line.v.x -= dx;
	line.v.y -= dy;
}
Rectangle.prototype.bx = function(){
	return this.x+this.w;
}
Rectangle.prototype.by = function(){
	return this.y+this.h;
}
Rectangle.prototype.pointWithin = function(p){
	var n = {x: p.x, y: p.y};
	if(n.x < this.x) n.x = this.x;
	if(n.y < this.y) n.y = this.y;
	if(n.x >= this.x+this.w) n.x = this.x+this.w-1;
	if(n.y >= this.y+this.h) n.y = this.y+this.h-1;
	return n;
}
Rectangle.prototype.within = function(bounding){
	if(
		this.x >= bounding.x && 
		this.y >= bounding.y && 
		this.x+this.w < bounding.x+bounding.w && 
		this.y+this.h < bounding.x+bounding.h){
		
		return this;
	}
	var n = new Rectangle(this.x,this.y,this.w,this.h);
	if(n.x < bounding.x){
		var dx = bounding.x-n.x;
		if(dx < n.w) n.w -= dx;
		else n.w = 0;
		n.x = bounding.x;
	}
	if(n.y < bounding.y){
		var dy = bounding.y-n.y;
		if(dy < n.h) n.h -= dy;
		else n.h = 0;
		n.y = bounding.y;
	}
	if(n.bx() >= bounding.bx()) n.w -= n.bx() - bounding.bx();
	if(n.by() >= bounding.by()) n.w -= n.by() - bounding.by();
	if(n.w <= 0 || n.h <= 0) return;
	
	return n;
}

Rectangle.prototype.lineWithin = function(line){
	var n = {p: {x:line.p.x,y:line.p.y},v:{x:line.v.x,y:line.v.y}};
	var p = n.p;
	var v = n.v;
	
	if(p.x < this.x){
		if(v.x <= 0) return;//the line doesn't intersect the rectangle
		var dx = this.x - p.x;
		var dy = v.y*(dx/v.x);
		if(dx > v.x) return;
		squishLineByPoint(n,dx,dy);
	}else if(p.x >= this.bx()){
		if(v.x >= 0) return;//the line doesn't intersect the rectangle
		var dx = this.bx() - p.x;
		if(-dx > -v.x) return;
		var dy = v.y*(dx/v.x);
		squishLineByPoint(n,dx,dy);
	}
	
	if(p.y < this.y){
		if(v.y <= 0) return;//the line doesn't intersect the rectangle
		var dy = this.y - p.y;
		if(dy > v.y) return;
		var dx = v.x*(dy/v.y);
		squishLineByPoint(n,dx,dy);
	}else if(p.y >= this.by()){
		if(v.y >= 0) return;//the line doesn't intersect the rectangle
		var dy = this.by() - p.y;
		if(-dy > -v.y) return;
		var dx = v.x*(dy/v.y);
		squishLineByPoint(n,dx,dy);
	}
	
	//at this point, we can be sure that the line intersects the rectangle,
	//since its start point is now inside the rectangle

	if(p.x+v.x < this.x){
		var dx = this.x - (p.x+v.x);
		var dy = v.y*(dx/v.x);
		v.x += dx;
		v.y += dy;
	}else if(p.x+v.x >= this.bx()){
		var dx = (p.x+v.x) - this.bx();
		var dy = v.y*(dx/v.x);
		v.x -= dx;
		v.y -= dy;
	}
	
	if(p.y+v.y < this.y){
		var dy = this.y - (p.y+v.y);
		var dx = v.x*(dy/v.y);
		v.x += dx;
		v.y += dy;
	}else if(p.y+v.y >= this.by()){
		var dy = (p.y+v.y) - this.by();
		var dx = v.x*(dy/v.y);
		v.x -= dx;
		v.y -= dy;
	}
	
	return n;
}

/*
function selfTest(){
	var rect;
	var line;
	
	rect = new Rectangle(0,0,10,10);
	line = {p:{x:5,y:5},v:{x:-3,y:-3}};
	_.assertEqual(JSON.stringify(line), JSON.stringify(rect.lineWithin(line)));

	line = {p:{x:1,y:1},v:{x:-3,y:-3}};
	_.assertEqual(JSON.stringify({p:{x:1,y:1},v:{x:-1,y:-1}}), JSON.stringify(rect.lineWithin(line)));

	line = {p:{x:-1,y:-1},v:{x:3,y:3}};
	_.assertEqual(JSON.stringify({p:{x:0,y:0},v:{x:2,y:2}}), JSON.stringify(rect.lineWithin(line)));

	rect = new Rectangle(5,5,5,5);
	line = {p:{x:-1,y:-1},v:{x:3,y:3}};
	_.assertEqual(undefined, JSON.stringify(rect.lineWithin(line)));

	line = {p:{x:10,y:10},v:{x:3,y:3}};
	_.assertEqual(undefined, JSON.stringify(rect.lineWithin(line)));

	line = {p:{x:3,y:3},v:{x:15,y:15}};
	_.assertEqual(JSON.stringify({p:{x:5,y:5},v:{x:5,y:5}}), JSON.stringify(rect.lineWithin(line)));

	line = {p:{x:15,y:15},v:{x:-20,y:-20}};
	_.assertEqual(JSON.stringify({p:{x:10,y:10},v:{x:-5,y:-5}}), JSON.stringify(rect.lineWithin(line)));
	
	console.log('rect passed self-test');
}
selfTest();
*/


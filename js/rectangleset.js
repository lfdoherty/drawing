//#requires field
/*
Provides overlap checking of a set of rectangles
*/

var RectangleSet = {};

(function(){

RectangleSet.new = function(width,height){
	var r = new RectangleSetImpl(width,height);
	r.f = new Field(width,height);
	return r;
}
function RectangleSetImpl(width, height){
}

RectangleSetImpl.prototype.add = function(rect){
	if(this.willOverlap(rect)){
		throw new Error('overlap!');
	}
	this.f.incrementRectangleSafely(rect.x,rect.y,rect.w,rect.h);
}

RectangleSetImpl.prototype.copy = function(){
	var n = new RectangleSetImpl(this.f.sx,this.f.sy);
	n.f = this.f.copy();
	return n;
}

RectangleSetImpl.prototype.move = function(oldRect, newRect){
	var safeOldRect = oldRect.within(this.f.rect);
	var oldSum = this.f.sumRectangleSafely(oldRect.x,oldRect.y,oldRect.w,oldRect.h);
	var area = safeOldRect.area();
	if(area !== oldSum){
		throw new Error('moving rectangle wasn\'t there in the first place: ' + oldSum + ' != ' + area);
	}
	this.f.decrementRectangleSafely(oldRect.x,oldRect.y,oldRect.w,oldRect.h);
	this.f.incrementRectangleSafely(newRect.x,newRect.y,newRect.w,newRect.h);
}
RectangleSetImpl.prototype.willOverlap = function(rect){
	var sum = this.f.sumRectangleSafely(rect.x,rect.y,rect.w,rect.h);
	return sum !== 0;
}

})();


function Heightmap(sx,sy){

	this.sx = sx;
	this.sy = sy;
	
	this.data = [];
}

Heightmap.prototype.size = function(){
	return {x: this.sx, y: this.sy};
}

Heightmap.prototype.initialize = function(f){

	for(var x=0;x<this.sx;++x){
		for(var y=0;y<this.sy;++y){
			
			var i = x*this.sy + y;
			this.data[i] = Math.max(0, f(x,y));
		}
	}
}

function transferAmount(ha, hb, va, vb, k){

	var d = (ha - hb)*k;
	if(d > 0){
		d = Math.min(va, d);
	}else{
		d = -Math.min(vb,-d);
	}
	return d;
}

function doTransfer(data, i, j, base, k){
	var va = data[i];
	var vb = data[j];
	var ha = va + base[i];
	var hb = vb + base[j];
	var t = transferAmount(ha, hb, va, vb, k);
	data[i] -= t;
	data[j] += t;
}

Heightmap.prototype.changeAll = function(amount){
	for(var i=0;i<this.data.length;++i){
		this.data[i] += amount;
		if(this.data[i] < 0) this.data[i] = 0;
	}
}

Heightmap.prototype.smooth = function(smoothRate, baseMap){

	var data = this.data;
	var basedata = baseMap.data;

	for(var x=1;x<this.sx;++x){
		for(var y=1;y<this.sy;++y){
			
			var qy = x*this.sy;
			var mqy = (qy-this.sy);
			var ny = (y-1);
			
			var i = qy + y;

			doTransfer(data, i, mqy + y, basedata, smoothRate);
			doTransfer(data, i, qy + ny, basedata, smoothRate);
			doTransfer(data, i, mqy + ny, basedata, smoothRate);
		}
	}
}

Heightmap.prototype.get = function(x,y){
	var i = x*this.sy + y;
	return this.data[i];
}

Heightmap.prototype.realF = function(){
	var local = this;
	return function(x,y){
		x = Math.floor(x);
		y = Math.floor(y);
		return local.get(x,y);
	}
}

Heightmap.prototype.change = function(x,y,amount){
	var i = x*this.sy + y;
	this.data[i] += amount;
	if(this.data[i] < 0) this.data[i] = 0;
}

var f = Math.floor;
var c = Math.ceil;
Heightmap.prototype.getGravityVectorWithBase = function(result,x,y,baseMap){

	var p1x = f(x),
		p1y = f(y),

		p2x = f(x),
		p2y = c(y),
		
		p3x = c(x),
		p3y = f(y);
		
	var p1h = this.get(p1x,p1y) + baseMap.get(p1x,p1y);
	var p2h = this.get(p2x,p2y) + baseMap.get(p2x,p2y);
	var p3h = this.get(p3x,p3y) + baseMap.get(p3x,p3y);
	
	//var d1 = distance2(p1x,p1y,x,y);
	//var d2 = distance2(p2x,p2y,x,y);
	//var d3 = distance2(p3x,p3y,x,y);
	
	var dx = p1h - p3h;
	var dy = p1h - p2h;
	
	//var result = {dx: dx, dy: dy};
	
	//if(Math.random() > .999) console.log(JSON.stringify(result) + JSON.stringify([p1h, p2h, p3h]));
	
	//return result;
	result.dx = dx;
	result.dy = dy;
}

Heightmap.prototype.getGravityVector = function(result,x,y){

	var p1x = f(x),
		p1y = f(y),

		p2x = f(x),
		p2y = c(y),
		
		p3x = c(x),
		p3y = f(y);
		
	var p1h = this.get(p1x,p1y);
	var p2h = this.get(p2x,p2y);
	var p3h = this.get(p3x,p3y);

	
	var dx = p1h - p3h;
	var dy = p1h - p2h;

	result.dx = dx;
	result.dy = dy;
}

exports.Heightmap = Heightmap

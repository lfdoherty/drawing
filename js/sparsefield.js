
var _ = require('underscorem')
var lineModule = require('./line')

function SparseField(){
	this.data = [];
}
SparseField.prototype.copy = function(){
	var n = new SparseField();
	var keys = Object.keys(this.data);
	for(var i=0;i<keys.length;++i){
		var key = keys[i];
		var newRow = n.data[key] = [];
		var row = this.data[key];
		var rowKeys = Object.keys(row);
		for(var j=0;j<rowKeys.length;++j){
			var rk = rowKeys[j];
			newRow[rk] = row[rk];
		}
	}
	return n;
}

SparseField.prototype.set = function(x,y,v){
	var row = this.data[y];
	if(row === undefined){
		row = [];
	}
	row[x] = v;
}
SparseField.prototype.getUnsafe = function(x,y){
	var row = this.data[y];
	if(row === undefined){
		return;
	}
	return row[x];
}
SparseField.prototype.get = function(x,y){
	return this.getUnsafe(x,y);
}

SparseField.prototype.sumRectangleSafely = function(x,y,w,h){
	var sum = 0;
	for(var iy=y;iy<y+h;++iy){
		var row = this.data[iy];
		if(row){
			for(var ix=x;ix<x+w;++ix){
				var v = row[ix];
				if(v){
					sum += v;
				}
			}
		}
	}
	return sum;
}
SparseField.prototype.sumRectangle = SparseField.prototype.sumRectangleSafely

SparseField.prototype.incrementRectangleSafely = function(x,y,w,h){
	for(var iy=y;iy<y+h;++iy){
		var row = this.data[iy];
		if(row === undefined){
			row = this.data[iy] = [];
		}
		for(var ix=x;ix<x+w;++ix){
			var v = row[ix];
			if(v){
				row[ix] = v+1;
			}else{
				row[ix] = 1;
			}
		}
	}
}
SparseField.prototype.decrementRectangleSafely = function(x,y,w,h){
	for(var iy=y;iy<y+h;++iy){
		var row = this.data[iy];
		if(row === undefined){
			row = this.data[iy] = [];
		}
		for(var ix=x;ix<x+w;++ix){
			var v = row[ix];
			if(v){
				row[ix] = v-1;
			}else{
				row[ix] = -1;
			}
		}
	}
}
SparseField.prototype.clear = function(){
	this.data = [];
}


SparseField.prototype.thickLine = function(line,f,starting,ending){
	_.assertObject(line);
	var oldLine = line;
	line = lineModule.extendLine(line,starting,ending)
	line = lineModule.intLine(line);
	
	var sy = this.sy;
	var data = this.data;
	lineModule.drawLineThick(line.p.x,line.p.y,line.p.x+line.v.x,line.p.y+line.v.y,function thickLinePixel(x,y){
		var row = data[y];
		if(row === undefined) row = data[y] = [];
		row[x] = f(x,y,row[x]);
	});
}

module.exports = SparseField

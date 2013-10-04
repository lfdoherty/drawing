
function RleBooleanField(){//(sx,sy){
	this.data = [];
	//this.f = new Field(sx,sy,false);
}

module.exports = RleBooleanField

RleBooleanField.prototype.copy = function(){
	var n = new RleBooleanField()//(this.f.sx,this.f.sy);
	var keys = Object.keys(this.data);
	for(var i=0;i<keys.length;++i){
		var index = keys[i];
		n.data[index] = [].concat(this.data[index]);
	}
	//n.f = this.f.copy();
	return n;
}

RleBooleanField.prototype.set = function(x,y,v){
	x = Math.floor(x);
	y = Math.floor(y);

	var row = this.data[y];
	if(row === undefined) row = this.data[y] = [];
	
	var cv = false;
	var i=0;
	for(;i<row.length;++i){
		var off = row[i];
		if(off > x){
			break;
		}
		cv = !cv;
	}

	//var oldRow = [].concat(row);
	if(v !== cv){
		if(i > 0 && row[i-1] === x){
			row[i-1]++;
			if(row[i] === row[i-1]){
				row.splice(i-1,2);
			}
		}else{
			row.splice(i,0,x,x+1);
		}
	}
/*
	this.f.set(x,y,v)

	var state = false;
	var tr = [];
	for(var j=0;j<this.f.sx;++j){
		var nv = this.f.get(j,y);
		if(state !== !!nv){
			state = !!nv;
			tr.push(j);
		}
	}
	if(state) tr.push(this.f.sx);
	
	if(JSON.stringify(tr) !== JSON.stringify(row)){
		throw new Error('invalid row state');
	}*/
}
RleBooleanField.prototype.getUnsafe = function(x,y){

	var row = this.data[y];
	if(row === undefined) return false;
	
	var y = false;
	var i=0;
	for(;i<row.length;++i){
		var off = row[i];
		if(off > x){
			break;
		}
		y = !y;
	}
	/*if(this.f.get(x,y) !== y){
		throw new Error('field does not match');
	}*/
	return y;
}
RleBooleanField.prototype.get = function(x,y){
	x = Math.floor(x);
	y = Math.floor(y);

	var row = this.data[y];
	if(row === undefined) return false;
	
	var state = false;
	var i=0;
	for(;i<row.length;++i){
		var off = row[i];
		if(off > x){
			break;
		}
		state = !state;
	}
	/*if(!!this.f.get(x,y) !== state){
		throw new Error('field does not match');
	}*/
	return state;
}

RleBooleanField.prototype.sumRectangleSafely = function(x,y,w,h){
	var sum = 0;
	//var alt = 0;
	for(var iy=y;iy<y+h;++iy){
		var row = this.data[iy];
		//var rs = 0;
		//var as = 0;
		if(row){
			var state = false;
			var inn = false;
			var prev = x;
			for(var i=0;i<row.length;++i){
				var off = row[i];
				state = !state;
				if(off >= x+w){
					if(!state){
						sum += x+w-prev;
						//rs += x+w-prev;
					}
					break;
				}
				
				if(inn){
					if(!state){
						sum += off-prev;
						//rs += off-prev
					}else{
						prev = off;
					}
				}else{
					if(off >= x){
						inn = true;
						if(!state){
							sum += off-x;
							//rs += off-x
						}else{
							prev = off;
						}
					}
				}
			}
		}
		/*for(var ix=x;ix<x+w;++ix){
			if(this.get(ix,iy)){
				++alt;
				//++as;
			}
		}*/
		//if(as !== rs){
		//	throw new Error('non row match');
		//}
	}
	/*if(alt !== sum){
		throw new Error('non match');
	}*/
	/*if(this.f.sumRectangleSafely(x,y,w,h) !== sum){
		throw new Error('field does not match');
	}*/
	return sum;
}

RleBooleanField.prototype.setRectangleSafely = function(x,y,w,h){
	for(var iy=y;iy<y+h;++iy){
		for(var ix=x;ix<x+w;++ix){
			this.set(ix,iy,true)
		}
		/*var row = this.data[iy];
		if(row === undefined){
			row = [x,x+w];
		}else{
			var off;
			var state = false;
			for(var i=0;i<row.length;++i){
				off = row[i];
				state = !state;
				if(off >= x+w){
					if(off > x+w){
						row.splice(i-1,0,x+w);
					}
				}
				if(off >= x){
					if(!state){
						row.splice(i,1);
						--i;
						state = true;
					}
				}
			}
		}*/
	}
	/*this.f.rectangle(x,y,w,h,function(x,y,v){
		return true;
	})*/
}
RleBooleanField.prototype.clearRectangleSafely = function(x,y,w,h){
	for(var iy=y;iy<y+h;++iy){
		for(var ix=x;ix<x+w;++ix){
			this.set(ix,iy,false)
		}
	}
	/*this.f.rectangle(x,y,w,h,function(x,y,v){
		return false;
	})*/
}
RleBooleanField.prototype.clear = function(){
	this.data = [];
	//this.f.clear();
}
/*
RleBooleanField.prototype.scanTrue = function(f){
	for(var y=0;y<this.data.length;++y){
		var row = this.data[y];
		var x = row[0];
		for(var i=1;i<row.length;i+=2){
			var ex = row[i];
			f(x,ex,y);
			x = row[i+1];
		}
		f(x, this.sx-1, y);
	}
}*/


"use strict";

//#requires line rectangle circle rlefield sparsefield

var Rectangle = require('./rectangle').Rectangle

function Field(sx, sy, defaultValue, outOfRangeValue){
	this.sx = sx;
	this.sy = sy;
	this.rect = new Rectangle(0,0,sx,sy);
	var n = sx*sy;
	this.data = new Array(n);

	this.outOfRangeValue = undefined;
	if(arguments.length > 3) this.outOfRangeValue = outOfRangeValue;
	//console.log('def: ' + typeof(defaultValue));
	if(arguments.length > 2){
		if(typeof(defaultValue) === 'function'){
			//console.log('def');
			for(var x=0;x<this.sx;++x){
				for(var y=0;y<this.sy;++y){
					var i = x*this.sy + y;
					this.data[i] = defaultValue(x,y);
				}
			}
		}else{
			for(var i=0;i<n;++i){
				this.data[i] = defaultValue;
			}
		}
	}
}
exports.Field = Field

Field.prototype.copy = function(){
	var f = new Field(this.sx,this.sy);
	f.outOfRangeValue = this.outOfRangeValue;
	f.data = [].concat(this.data);
	f.rect = this.rect;
	return f;
}
Field.prototype.clear = function(){
	this.data = [];
}
function setPixelValue(imageData, index, r, g, b) {
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = 256;
}
Field.prototype.copyToImage = function(colouring, img){
	if(arguments.length !== 2) throw 'wrong number of arguments';
	var index = 0;
	for(var x=0;x<this.sx;++x){
		for(var y=0;y<this.sy;++y){
			var v = this.get(y,x);
			//v = Math.floor(v);
			setPixelValue(img, index, Math.floor(v*colouring.r), Math.floor(v*colouring.g), Math.floor(v*colouring.b));
			index += 4;
		}
	}
}
/*
Field.prototype.copyToImage = function(mx, my, bx, by, colouring, img){
	if(arguments.length === 2){
		colouring = mx;
		img = my;
		mx = 0;
		my = 0;
		bx = this.sx;
		by = this.sy;
	}else{
		if(arguments.length !== 6) throw 'must be called with (mx,my,bx,by,colouring,img) or (colouring.img)';
	}
	var index = 0;
	for(var x=mx;x<bx;++x){
		for(var y=my;y<by;++y){
			var v = this.get(x,y);
			v = Math.floor(v);
			setPixelValue(img, index, v*colouring.r, v*colouring.g, v*colouring.b);
			index += 4;
		}
		index += (img.width - (by-my))*4;
	}
}*/
Field.prototype.scaledCopy = function(){

	var n = this.sx*this.sy;
	var dmin = Number.MAX_VALUE, dmax = Number.MIN_VALUE;
	for(var i=0;i<n;++i){
		var v = this.data[i];
		if(isNaN(v)) throw 'cannot make scaled copy of field with non-number value: ' + v;
		if(v < dmin) dmin = v;
		if(v > dmax) dmax = v;
	}
	console.log('rescaling ' + dmin + ' ' + dmax);
	var local = this;
	var copy = new Field(this.sx, this.sy, function(x,y){
		var i = local.sy*x + y;
		var v = local.data[i];
		return (v - dmin)/(dmax-dmin);
		
	},undefined);
	
	return copy;
}

Field.prototype.all = function(f){
	for(var x=0;x<this.sx;++x){
		for(var y=0;y<this.sy;++y){
			var i = x*this.sy + y;
			this.data[i] = f(x,y,this.data[i]);
		}
	}
}
Field.prototype.visit = function(f){
	for(var x=0;x<this.sx;++x){
		for(var y=0;y<this.sy;++y){
			var i = x*this.sy + y;
			f(x,y,this.data[i]);
		}
	}
}
Field.prototype.yVisit = Field.prototype.visit;
Field.prototype.xVisit = function(f){
	for(var y=0;y<this.sy;++y){
		for(var x=0;x<this.sx;++x){
			var i = x*this.sy + y;
			f(x,y,this.data[i]);
		}
	}
}

Field.prototype.findNearest = function(px,py){
	px = Math.floor(px);
	py = Math.floor(py);
	
	var i = px*this.sy + py;
	var v = this.data[i];
	if(v !== undefined) return v;
	
	var maxr = Math.max(this.sx,this.sy);

	var data = this.data;
	var sx = this.sx;
	var sy = this.sy;

	var nearest;
	var r = 1;
	
	function safe(x,y){
		if(x < 0 || y < 0 || x >= sx || y >= sy) return;
		var i = x*sy + y;
		var v = data[i];
		if(v !== undefined){
			nearest = v;
		}
	}
	function unsafe(x,y){
		var i = x*sy + y;
		var v = data[i];
		if(v !== undefined){
			nearest = v;
		}
	}
	for(;r<maxr;++r){
		if(px >= r && py >=r && px+r < sx && py+r < sy){
			drawCircle(px,py,r,unsafe);
		}else{
			drawCircle(px,py,r,safe);
		}
		if(nearest){
			//console.log('found nearest: ' + px + ',' + py + ' -> ' + nearest[0] + ',' + nearest[1] + ' (' + r + ')');
			return nearest;
		}
	}
}
Field.prototype.parallelTraversal = function(startingPoints, f){
	var bigr = Math.ceil(Math.sqrt(this.sx*this.sx, this.sy*this.sy));
	var front = [].concat(startingPoints);
	for(var rad=1;rad<bigr;++rad){
		var next = [];
		for(var i=0;i<front.length;++i){
			var p = front[i];
			if(typeof(p.x) !== 'number') throw 'err';
			var did = false;
			this.singleTraversal(p.x,p.y,rad,function(nx,ny,v,d){
				var dd = f(nx,ny,v,p,d);
				did = dd || did;
			});
			
			if(did){
				next.push(p);
			}
		}
		if(next.length === 0) break;
		front = next;
	}
}
Field.prototype.singleTraversal = function(px,py,r,f){

	px = Math.floor(px);
	py = Math.floor(py);

	var data = this.data;
	var sx = this.sx;
	var sy = this.sy;

	function safe(x,y,dx,dy){
		if(x < 0 || y < 0 || x >= sx || y >= sy) return;
		var i = x*sy + y;
		var v = data[i];
		if(v !== undefined){
			var dd = Math.sqrt(dx*dx + dy*dy);
			f(x,y,v,dd);
		}
	}
	function unsafe(x,y,dx,dy){
		var i = x*sy + y;
		var v = data[i];
		if(v !== undefined){
			var dd = Math.sqrt(dx*dx + dy*dy);
			f(x,y,v,dd);
		}
	}
	if(px >= r && py >= r && px+r < sx && py+r < sy){
		drawCircle(px,py,r,unsafe);
	}else{
		drawCircle(px,py,r,safe);
	}
}

Field.prototype.traversal = function(px,py,f,maxr,minr){

	px = Math.floor(px);
	py = Math.floor(py);

	if(maxr) maxr = Math.min(maxr,Math.max(this.sx,this.sy));
	else maxr = Math.max(this.sx,this.sy);
	
	var data = this.data;
	var sx = this.sx;
	var sy = this.sy;
	
	var r = 1;
	if(minr !== undefined) r = minr;
	
	var continuing;
	function safe(x,y,dx,dy){
		if(x < 0 || y < 0 || x >= sx || y >= sy) return;
		var i = x*sy + y;
		var v = data[i];
		if(v !== undefined){
			var dd = Math.sqrt(dx*dx + dy*dy);
			var d = f(x,y,v,dd);//r);
			continuing = continuing || d;
		}
	}
	function unsafe(x,y,dx,dy){
		var i = x*sy + y;
		var v = data[i];
		if(v !== undefined){
			var dd = Math.sqrt(dx*dx + dy*dy);
			var d = f(x,y,v,dd)//r);
			continuing = continuing || d;
		}
	}
	for(;r<maxr;++r){
		continuing = false;
		
		if(px >= r && py >= r && px+r < sx && py+r < sy){
			drawCircle(px,py,r,unsafe);
		}else{
			drawCircle(px,py,r,safe);
		}
		if(!continuing) return;
	}
}

Field.prototype.squareTraversal = function(px,py,f){
	px = Math.floor(px);
	py = Math.floor(py);
	
	//console.log('traversaling');
	var dmx = true, dmy = true, dbx = true, dby = true;
	for(var ad=1;ad<this.sx;++ad){
		if(px + ad >= this.sx) dbx = false;
		if(px - ad < 0) dmx = false;

		if(py + ad >= this.sy) dby = false;
		if(py - ad < 0) dmy = false;
		
		var found = false;
		
		var mx = Math.max(0,px-ad);
		var bx = Math.min(px+ad,this.sx);
		var my = Math.max(0,py-ad);
		var by = Math.min(py+ad,this.sy);
		
		//console.log(JSON.stringify([adx,ady,mx,my,bx,by]));
		
		if(dmy){
			for(var x=mx+1;x<bx-1;++x) found = f(x,my) || found;
		}
		if(dby){
			for(var x=mx+1;x<bx-1;++x) found = f(x,by) || found;
		}
		if(dmx){
			for(var y=my;y<by;++y) found = f(mx,y) || found;
		}
		if(dbx){
			for(var y=my;y<by;++y) found = f(bx,y) || found;
		}
		
		if(!found) return;
	}
}
Field.prototype.searchKernel = function(px,py,a, f){
	px = Math.floor(px);
	py = Math.floor(py);
	
	for(var dx=-a; dx<=a;++dx){
		var x = dx + px;
		if(x >= this.sx || x < 0) continue;
		for(var dy=-a; dy<=a;++dy){
			var y = dy + py;
			if(y >= this.sy || y < 0) continue;
			var i = this.sy*x + y;
			var res = f(x,y,this.data[i],dx,dy);
			if(res) return res;
		}
	}
}
Field.prototype.visitKernel = function(px,py,a, f){
	px = Math.floor(px);
	py = Math.floor(py);
	
	for(var dx=-a; dx<=a;++dx){
		var x = dx + px;
		if(x >= this.sx || x < 0) continue;
		for(var dy=-a; dy<=a;++dy){
			var y = dy + py;
			if(y >= this.sy || y < 0) continue;
			var i = this.sy*x + y;
			f(x,y,this.data[i],dx,dy);
		}
	}
}
Field.prototype.kernel = function(px,py,a, f){
	px = Math.floor(px);
	py = Math.floor(py);
	
	for(var dx=-a; dx<=a;++dx){
		var x = dx + px;
		if(x >= this.sx || x < 0) continue;
		for(var dy=-a; dy<=a;++dy){
			var y = dy + py;
			if(y >= this.sy || y < 0) continue;
			var i = this.sy*x + y;
			this.data[i] = f(this.data[i],dx,dy,x,y);
		}
	}
}
Field.prototype.kernelEmpty = function(px,py,a, f){
	px = Math.floor(px);
	py = Math.floor(py);
	
	for(var dx=-a+1; dx<a;++dx){
		var x = dx + px;
		if(x >= this.sx || x < 0) continue;
		for(var dy=-a+1; dy<a;++dy){
			var y = dy + py;
			if(y >= this.sy || y < 0) continue;
			var i = this.sy*x + y;
			if(this.data[i] === undefined){
				this.data[i] = f(dx,dy,x,y);
			}
		}
	}
}

Field.prototype.area = function(px,py,a){
	px = Math.floor(px);
	py = Math.floor(py);
	
	var total = 0;
	for(var x=-a+1+px; x<a+px;++x){
		for(var y=-a+1+py; y<a+py;++y){
			total += this.get(x,y);
		}
	}
	return total;
}

Field.prototype.getUnsafe = function getUnsafe(x,y){
	var i = this.sy*x + y;
	return this.data[i];
}
Field.prototype.get = function get(x,y){
	x = Math.floor(x);
	y = Math.floor(y);

	if(x >= this.sx || y >= this.sy || x < 0 || y < 0) return this.outOfRangeValue;

	var i = this.sy*x + y;
	return this.data[i];
}

Field.prototype.add = function(x,y,v){
	x = Math.floor(x);
	y = Math.floor(y);

	if(x >= this.sx || y >= this.sy || x < 0 || y < 0) return;

	var i = this.sy*x + y;
	this.data[i] += v;
}

Field.prototype.set = function(x,y,v){
	x = Math.floor(x);
	y = Math.floor(y);

	if(x >= this.sx || y >= this.sy || x < 0 || y < 0) return;

	var i = this.sy*x + y;
	this.data[i] = v;
}
Field.prototype.floor = function(x,y,v){
	x = Math.floor(x);
	y = Math.floor(y);

	if(x >= this.sx || y >= this.sy || x < 0 || y < 0) return;

	var i = this.sy*x + y;
	if(this.data[i] < v) this.data[i] = v;
}
Field.prototype.localTraversal = function(x,y,f){
	var c = {x: x,y: y};
	var v = this.get(x,y);
	var found;
	var foundV;
	var foundDist;
	while(true){
		found = undefined;
		foundV = undefined;
		foundDist = -1;
		this.visitKernel(c.x,c.y,1,function(nx,ny,ov,dx,dy){
			if(ov === undefined) return;
			var res = f(c.x,c.y,v,nx,ny,ov);
			if(res){
				//found = true;
				var dist = Math.abs(dx) + Math.abs(dy);
				if(dist > foundDist){
					found = {x: nx,y: ny};
					foundV = ov;
					foundDist = dist;
				}
			}
		});
		if(found === undefined){
			break;
		}
		c = found;
		v = foundV;
	}
}

var rot1 = [[[0,2],[0,1],[0,0]],
			[[1,2],[1,1],[1,0]],
			[[2,2],[2,1],[2,0]]];

function rot(k){
	return  [[k[0][2],k[0][1],k[0][0]],
			 [k[1][2],k[1][1],k[1][0]],
			 [k[2][2],k[2][1],k[2][0]]];
}
function mirror(k){
	return  [[k[2][0],k[1][0],k[0][0]],
			 [k[2][1],k[1][1],k[0][1]],
			 [k[2][2],k[1][2],k[0][2]]];
}
var kernels = [];
function addKernel(k){

	function sameKernel(a,b){
		for(var x=0;x<3;++x){
			for(var y=0;y<3;++y){
				if(a[x][y] !== b[x][y]) return false;
			}
		}
		return true;
	}
	function add(k){
		for(var i=0;i<kernels.length;++i){
			if(sameKernel(k,kernels[i])){
				//console.log('same: ' + i);
				return;
			}
		}
		kernels.push(k);
		return true;
	}

	function mutate(k,n){
		if(n < 0) return;
		add(k);
		mutate(rot(k),n-1);
		mutate(mirror(k),n-1);
	}
	
	var isNew = add(k);
	if(!isNew) throw 'same';
	mutate(k,4);
}
addKernel([[0,1,0],
		   [1,1,0],
		   [0,0,0]]);
addKernel([[1,1,0],
		   [1,1,0],
		   [0,0,0]]);
addKernel([[0,0,1],
		   [0,1,1],
		   [0,1,0]]);
addKernel([[0,1,1],
		   [1,1,0],
		   [1,0,0]]);
addKernel([[0,0,0],
		   [0,1,0],
		   [1,1,1]]);
addKernel([[0,0,0],
		   [0,1,1],
		   [1,1,1]]);
addKernel([[1,1,0],
		   [0,1,0],
		   [0,0,0]]);
addKernel([[1,1,1],
		   [1,1,0],
		   [1,0,0]]);
addKernel([[0,1,0],
		   [1,1,1],
		   [0,0,0]]);
addKernel([[0,0,0],
		   [0,1,0],
		   [1,0,0]]);
addKernel([[0,0,0],
		   [0,1,0],
		   [0,1,0]]);

Field.prototype.computeCentroids = function(){
	var allEdgePoints = [];
	computeEdges(this, function(x,y){
		allEdgePoints.push({x: x,y: y});
	});
	var distanceMap = new Field(this.sx, this.sy,-1);
	distanceMap.parallelTraversal(allEdgePoints, function(nx,ny,currentDistance,ep,d){
		if(currentDistance !== -1) return;
		if(!contbuf.get(nx,ny)){
			return;
		}
		//var dd = dist(nx,ny,ep[0],ep[1]);
		//distanceMap.set(nx,ny,dd);
		distanceMap.set(nx,ny,d);
		return true;
	});
	var dists = {};
	var distPoints = {};
	var local = this;
	distanceMap.visit(function(x,y,d){
		if(d === -1) return;
		var v = local.get(x,y);
		if(dists[v] === undefined || dists[v] < d){
			dists[v] = d;
			distPoints[v] = {x: x,y: y,v: v};
		}
	});
	ctx.fillStyle = 'green';
	var pointsList = [];
	var distKeys = Object.keys(distPoints);
	for(var i=0;i<distKeys.length;++i){
		var key = distKeys[i];
		pointsList.push(distPoints[key]);
		ctx.fillRect(distPoints[key].x, distPoints[key].y,3,3);
	}
	return pointsList;
}
function dist(x,y,nx,ny){
	var dx = x-nx;
	var dy = y-ny;
	return Math.sqrt(dx*dx + dy*dy);
}
function computeEdges(field, f){
	function couldBeEdge(x,y,v){
		if(v !== undefined){
			if(x === 0) return true;
			if(y === 0) return true;
			if(x === field.sx-1) return true;
			if(y === field.sy-1) return true;
		}
		return field.searchKernel(x,y,1,function(nx,ny,ov,dx,dy){
			return (ov !== v && (dx >= 0 && dy >= 0) && (dx > 0 || dy > 0));
		});
	}
	
	field.visit(function(x,y,v){
		if(couldBeEdge(x,y,v)){
			f(x,y);
		}
	});
}

/*
	We compute edges by tracing *between* the pixels.
*/
Field.prototype.polygonizeEdges = function(){
	
	//var nodeMap = new Field(this.sx+1,this.sy+1);
	
	//ctx.strokeStyle='white';
	//ctx.lineWidth = .5;
	
	var nodes = {};
	var specialNodes = [];
	function makeEdge(ax,ay,bx,by,av,bv){
		var ak = ax+','+ay;
		var bk = bx+','+by;
		
		var an = nodes[ak];
		var bn = nodes[bk];
		if(an === undefined){
			an = nodes[ak] = {links: [], x: ax, y: ay, values: {}}
			//nodeMap.set(ax,ay,an);
		}
		if(bn === undefined){
			bn = nodes[bk] = {links: [], x: bx, y: by, values: {}}
			//nodeMap.set(bx,by,bn);
		}
		
		if(an.links.indexOf(bn) === -1) an.links.push(bn);
		if(bn.links.indexOf(an) === -1) bn.links.push(an);
		
		an.values[av] = true;
		an.values[bv] = true;
		bn.values[av] = true;
		bn.values[bv] = true;
		
		if(an.links.length === 3) specialNodes.push(an);//by using ===, we ensure we only push once
		if(bn.links.length === 3) specialNodes.push(bn);//by using ===, we ensure we only push once
		
		//ctx.beginPath();
		//ctx.moveTo(ax,ay);
		//ctx.lineTo(bx,by);
		//ctx.stroke();
	}
	
	var prev;
	this.xVisit(function(x,y,v){
		if(x === 0) prev = undefined;
		if(v !== prev){
			makeEdge(x,y,x,y+1,prev,v);
			prev = v;
		}
	});
	this.yVisit(function(x,y,v){
		if(y === 0) prev = undefined;
		if(v !== prev){
			makeEdge(x,y,x+1,y,prev,v);
			prev = v;
		}
	});
	for(var x=0;x<this.sx;++x){
		var y = this.sy-1;
		var v = this.get(x,y);
		if(v !== undefined){
			makeEdge(x,y+1,x+1,y+1,v,undefined);
		}
	}
	for(var y=0;y<this.sy;++y){
		var x = this.sx-1;
		var v = this.get(x,y);
		if(v !== undefined){
			makeEdge(x+1,y,x+1,y+1,v,undefined);
		}
	}
	
	var borders = [];
	specialNodes.forEach(function(sn){
		sn.taken = true;
		sn.links.forEach(function(n){
			var b = computeBorder(sn, n);
			if(b.length < 3){
				console.log('ignoring short border: ' + b.length);
				return;
			}

			var middleNode = b[1];
			
			if(middleNode.taken) return;
			if(b[b.length-2].taken) return;
			middleNode.taken = true;
			b[b.length-2].taken = true;
			
			/*
			var last = b[b.length-1];
			
			if(last.taken) return;
			
			last.taken = true;*/

			console.log('adding border: ' + b.length);
			//b.forEach(function(n){
			//	console.log(n.x + ',' + n.y + ': ' + JSON.stringify(n.values));
			//});
			/*
			if(last !== sn){
				var nsn = Object.keys(sn.values).length;
				if(nsn < 3){
					console.log('invalid border is not self-closing, but sn has only ' + nsn + ' neighboring regions');
					throw 'err';
				}
				var nlast = Object.keys(last.values).length
				if(nlast < 3){
					console.log('invalid border is not self-closing, but last has only ' + nlast + ' neighboring regions');
					throw 'err';
				}				
			}*/

			var kb = [];
			for(var i=2;i<b.length-2;i+=3){
				kb.push(b[i]);
			}
			b = b.slice(0,2).concat(kb).concat(b.slice(b.length-2));
			
			
			b.regions = [];
			Object.keys(middleNode.values).forEach(function(valueStr){
				if(valueStr === 'undefined'){
					b.regions.push(undefined);
				}else{
					b.regions.push(parseInt(valueStr));
				}
			});
			

			
			if(b.regions.length !== 2){
				throw 'programmer error: not 2 border regions';
			}
			borders.push(cleanBorder(b));
		});
		//computeConnectedBorders(sn);
	});
	
	function cleanBorder(b){
		var res = [];
		b.forEach(function(n){
			res.push({
				x: n.x,
				y: n.y
			});
		});
		res.regions = b.regions;
		return res;
	}
	
	function computeBorder(sn, n){
		var cn = n;
		var pn = sn;
		var nodes = [sn, n];
		while(cn.links.length === 2){
			var a = cn.links[0];
			var b = cn.links[1];
			
			var temp = cn;
			if(a === pn) cn = b;
			else cn = a;
			pn = temp;
			
			var icn = nodes.indexOf(cn);
			if(icn !== -1 && icn !== 0){
				throw 'border looping';
			}
			
			nodes.push(cn);
		}
		
		return nodes;
	}
	
	return borders;
}

Field.prototype.rectangleSafely = function(x,y,w,h,f){
	var rect = makeSafeRectangle(this,x,y,w,h);
	this.rectangle(rect.x,rect.y,rect.w,rect.h,f);
}

Field.prototype.incrementRectangleSafely = function incrementRectangleSafely(x,y,w,h){
	var rect = makeSafeRectangle(this,x,y,w,h);
	this.incrementRectangle(rect.x,rect.y,rect.w,rect.h);
}
Field.prototype.decrementRectangleSafely = function decrementRectangleSafely(x,y,w,h){
	var rect = makeSafeRectangle(this,x,y,w,h);
	this.decrementRectangle(rect.x,rect.y,rect.w,rect.h);
}
Field.prototype.decrementRectangle = function decrementRectangle(x,y,w,h){

	x = Math.floor(x);
	y = Math.floor(y);
	w = Math.floor(w);
	h = Math.floor(h);
/*
	checkRange(x,y,this)
	checkRange(x+w-1,y+h-1,this)
*/	
	var base = x*this.sy;
	for(var dx=0;dx<w;++dx){
		var index = base+y;
		for(var dy=0;dy<h;++dy){
			var v = this.data[index];
			this.data[index] = v ? v-1 : -1;
			++index;
		}
		base += this.sy;
	}
}
Field.prototype.incrementRectangle = function incrementRectangle(x,y,w,h){

	x = Math.floor(x);
	y = Math.floor(y);
	w = Math.floor(w);
	h = Math.floor(h);
/*
	checkRange(x,y,this)
	checkRange(x+w-1,y+h-1,this)
*/	
	var base = x*this.sy;
	for(var dx=0;dx<w;++dx){
		var index = base+y;
		for(var dy=0;dy<h;++dy){
			var v = this.data[index];
			this.data[index] = v ? v+1 : 1;
			++index;
		}
		base += this.sy;
	}
}

Field.prototype.rectangle = function rectangle(x,y,w,h,f){

	x = Math.floor(x);
	y = Math.floor(y);
	w = Math.floor(w);
	h = Math.floor(h);

	checkRange(x,y,this)
	checkRange(x+w-1,y+h-1,this)
	
	var base = x*this.sy;
	var nx = x;
	for(var dx=0;dx<w;++dx){
		var ny = y;
		for(var dy=0;dy<h;++dy){
			var index = base + ny;
			this.data[index] = f(nx,ny,this.data[index]);
			++ny;
		}
		base += this.sy;
		++nx;
	}
}

Field.prototype.visitRectangle = function visitRectangle(x,y,w,h,f){
	x = Math.floor(x);
	y = Math.floor(y);
	w = Math.floor(w);
	h = Math.floor(h);
	
	checkRange(x,y,this)
	checkRange(x+w-1,y+h-1,this)

	for(var dx=0;dx<w;++dx){
		var nx = x + dx;
		for(var dy=0;dy<h;++dy){
			var ny = y + dy;
			var index = nx*this.sy + ny;
			var v = this.data[index];
			f(nx,ny,v);
		}
	}
}

function makeSafeRectangle(field,x,y,w,h){
	_.assertLength(arguments, 5);
	if(x >= field.sx) return;
	if(y >= field.sy) return;
	if(x < 0){w+=x;x=0;}
	if(y < 0){h+=y;y=0;}
	if(x+w >= field.sx) w -= (x+w) - field.sx;
	if(y+h >= field.sy) h -= (y+h) - field.sy;
	
	return {x: x,y:y,w:w,h:h}
}

Field.prototype.sumRectangleSafely = function(x,y,w,h){
	var rect = makeSafeRectangle(this,x,y,w,h);
	if(!rect || rect.w === 0 || rect.h === 0) return;
	return this.sumRectangle(rect.x,rect.y,rect.w,rect.h);
}
Field.prototype.sumRectangle = function sumRectangle(x,y,w,h){
	/*var sum = 0;
	this.visitRectangle(x,y,w,h, function(x,y,v){
		if(v !== undefined){
			if(isNaN(v)){
				debugger;
				throw 'invalid non-number to sum: ' + v;
			}
			sum += v;
		}
	});
	return sum;*/
	
	var sum = 0;
	
	x = Math.floor(x);
	y = Math.floor(y);
	w = Math.floor(w);
	h = Math.floor(h);
	
	checkRange(x,y,this)
	checkRange(x+w-1,y+h-1,this)

	for(var dx=0;dx<w;++dx){
		var nx = x + dx;
		for(var dy=0;dy<h;++dy){
			var ny = y + dy;
			var index = nx*this.sy + ny;
			var v = this.data[index];
			//f(nx,ny,v);
			if(v !== undefined){
				sum += v;
			}
		}
	}
	
	return sum;
}

function checkRange(x,y,field){
	if(x >= field.sx || y >= field.sy || x < 0 || y < 0){
		debugger;
		throw 'out of range: ' + x + ',' + y;
	}
}
Field.prototype.fatLine = function(line,f,starting,ending){
	_.assertObject(line);
	
	line = this.rect.lineWithin(extendLine(line,starting,ending));
	line = intLine(this.rect.lineWithin(intLine(line)));
	
	var sy = this.sy;
	var data = this.data;
	var local = this;
	drawLineAntialiased(line.p.x,line.p.y,line.p.x+line.v.x,line.p.y+line.v.y,function fatLinePixel(x,y,c){
		if(c > 0){
			var index = x*sy + y;			
			var v = data[index];
			v = f(x,y,v,c);
			data[index] = v;
		}
	});
}

Field.prototype.visitFatLine = function(line,f,starting,ending){
	_.assertObject(line);
	
	line = this.rect.lineWithin(extendLine(line,starting,ending));
	line = intLine(line);
	
	var sy = this.sy;
	var data = this.data;
	var local = this;
	drawLineAntialiased(line.p.x,line.p.y,line.p.x+line.v.x,line.p.y+line.v.y,function visitFatLinePixel(x,y,c){
		if(c > 0){

			var index = x*sy + y;			
			var v = data[index];
			f(x,y,v,c);
		}
	});
}

Field.prototype.sumFatLine = function(vector,starting,ending){
	var sum = 0;
	this.visitFatLine(vector, function visitFatLinePixelForSum(x,y,v){
		if(v !== undefined){
			if(isNaN(v)) throw 'invalid non-number to sum: ' + v;
			sum += v;
		}
	},starting,ending);
	return sum;
}
/*
Field.prototype.thickLine = function(line,f,starting,ending){
	_.assertObject(line);
	
	line = this.rect.lineWithin(extendLine(line,starting,ending));
	line = intLine(line);
	
	var sy = this.sy;
	var data = this.data;
	drawLineThick(line.p.x,line.p.y,line.p.x+line.v.x,line.p.y+line.v.y,function thickLinePixel(x,y){
		var index = x*sy + y;			
		data[index] = f(x,y,data[index]);
	});
}*/

Field.prototype.thickLine = function thickLine(line,f,starting,ending){
	_.assertObject(line);
	
	line = this.rect.lineWithin(extendLine(line,starting,ending));
	line = intLine(this.rect.lineWithin(intLine(line)));

	var data = this.data;
	
	var x0 = line.p.x;
	var x1 = x0+line.v.x
	var y0 = line.p.y;
	var y1 = y0+line.v.y;

	var dx = Math.abs(line.v.x)
	var dy = Math.abs(line.v.y) 
	
	var dix;
	var sx, sy;
	if(x0 < x1){
		sx = 1 
		dix = this.sy;
	}else{
		sx = -1
		dix = -this.sy;
	}
	if(y0 < y1){
		sy = 1
	}else{
		sy = -1
	}
	var err = dx-dy

	var index = x0*this.sy + y0;			
	while(true){
		
		data[index] = f(x0,y0,data[index]);
		
		if(x0 === x1 && y0 === y1) break;
		
		var e2 = 2*err
		if(e2 > -dy) {
			err -= dy
			x0 += sx
			index += dix
		} else if(e2 < dx) {
			err += dx
			y0 += sy 
			index += sy
		}
	}
}

Field.prototype.visitThickLine = function(line,f,starting,ending){
	_.assertObject(line);
	
	line = this.rect.lineWithin(extendLine(line,starting,ending));
	line = intLine(line);
	
	var sy = this.sy;
	var data = this.data;
	var local = this;
	drawLineThick(line.p.x,line.p.y,line.p.x+line.v.x,line.p.y+line.v.y,function visitThickLinePixel(x,y){
		var index = x*sy + y;			
		var v = data[index];
		f(x,y,v);
	});
}

Field.prototype.sumThickLine = function(vector,starting,ending){
	var sum = 0;
	this.visitThickLine(vector, function visitThickLinePixelForSum(x,y,v){
		if(v !== undefined){
			//if(isNaN(v)) throw 'invalid non-number to sum: ' + v;
			sum += v;
		}
	},starting,ending);
	return sum;
}


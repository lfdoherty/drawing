//#requires ../linefill
function computeShadowHeight(hf, x, y, wx, wy, lightInclination, context){
	
	var h = context.h;
	
	var nh = hf(x,y);

	if(nh > h){
		h = nh;
	}else{
		var sh = h - lightInclination;
		if(nh < sh) h = sh;
		else h = nh;
	}

	
	if(nh < h){
		var v = 1;
		context.h = h;
		context.v = v;
	}else{
		context.h = h;
		context.v = 0;
	}
}

function simpleShadow(hf, wx, wy, outputRaster, padding, lightVector, lightInclination){

	//var h;
	var context = {};
	function startLine(x,y){
		context.h = hf(x,y);
	}
	function iterateLine(x,y){
		
		computeShadowHeight(hf, x, y, wx, wy, lightInclination, context);
		
		var ix = Math.floor(x);
		var iy = Math.floor(y);
		//if(Math.random() > .999) console.log(ix + ' ' + iy);
		if(ix>=0 && ix<wx && iy>=0 && iy<wy){
			//if(ix === 0 && iy === 0) console.log('
			outputRaster.set(ix,iy,context.v);
		}
	}
	lineFill(startLine, iterateLine, 0, 0, wx, wy, lightVector.x, lightVector.y);
}

function simpleShadowIsometric(hf, wx, wy, outputRaster, lightVector, lightInclination){

	if(wx === undefined) throw 'need wx';
	if(wy === undefined) throw 'need wy';

	var context = {};
	function startLine(x,y){
		context.h = hf(x,y);
	}
	function iterateLine(x,y){
		computeShadowHeight(hf, x, y, wx, wy, lightInclination, context);
		return context.v;
	}
	function screenPixel(ix,iy,v){
		//console.log(ix + ' ' + iy + ' ' + v);
		outputRaster.set(ix,iy,v);
	}
	lineFillIsometric(hf, screenPixel, startLine, iterateLine, 0, 0, wx, wy, lightVector.x, lightVector.y);
}


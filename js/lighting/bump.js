
function gradx2(f, x,y){
		
	var h = f(x,y);
	var grad = f(x+2, y) - h;

	return grad;
}

function grady2(f, x,y){

	var h = f(x,y);
	var grad = f(x, y+2) - h;

	return grad;

}


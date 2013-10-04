/*
function drawCircleWithin(cx,cy,radius,width,height,f){
	if(radius === 1){
		f(cx-1,cy-1);
		f(cx-1,cy);
		f(cx-1,cy+1);
		f(cx,cy-1);
		f(cx,cy);
		f(cx,cy+1);
		f(cx+1,cy-1);
		f(cx+1,cy);
		f(cx+1,cy+1);
		return;
	}
	
	var fv = 1-radius;
	var ddfx = 0;
	var ddfy = -2 * radius;
	var x=0;
	var y=radius;
	
	f(cx,cy+radius);
	f(cx,cy-radius);
	f(cx+radius,cy);
	f(cx-radius,cy);
	
	while(x < y) 
	{
	    if(fv >= 0) 
	    {
	        y--;
	        ddfy += 2;
	        fv += ddfy;
	    }else{
		    x++;
			ddfx += 2;
			fv += ddfx + 1;    
		}
		f(cx + x,cy + y);
		f(cx - x,cy + y);
		f(cx + x,cy - y);
		f(cx - x,cy - y);
		f(cx + y,cy + x);
		f(cx - y,cy + x);
		f(cx + y,cy - x);
		f(cx - y,cy - x);
	}
}
*/
function drawCircle(cx,cy,radius,f){
	if(radius === 1){
		f(cx-1,cy-1,-1,-1);
		f(cx-1,cy,  -1, 0);
		f(cx-1,cy+1,-1, 1);
		f(cx,cy-1,   0,-1);
		f(cx,cy,     0, 0);
		f(cx,cy+1,   0, 1);
		f(cx+1,cy-1, 1,-1);
		f(cx+1,cy,   1, 0);
		f(cx+1,cy+1, 1, 1);
		return;
	}
	
	var fv = 1-radius;
	var ddfx = 0;
	var ddfy = -2 * radius;
	var x=0;
	var y=radius;
	
	f(cx,cy+radius,0,radius);
	f(cx,cy-radius,0,-radius);
	f(cx+radius,cy,radius,0);
	f(cx-radius,cy,-radius,0);
	
	while(x < y) 
	{
	    if(fv >= 0) 
	    {
	        y--;
	        ddfy += 2;
	        fv += ddfy;
	    }else{
		    x++;
			ddfx += 2;
			fv += ddfx + 1;    
		}
		f(cx + x,cy + y, x,y);
		f(cx - x,cy + y, -x,y);
		f(cx + x,cy - y, x,-y);
		f(cx - x,cy - y, -x,-y);
		f(cx + y,cy + x, y,x);
		f(cx - y,cy + x, -y,x);
		f(cx + y,cy - x, y,-x);
		f(cx - y,cy - x, -y,-x);
	}
}
exports.drawCircle = drawCircle

/*
void search_circle(int cx, int cy, int radius, const ipoint& p, float& nearest_distance, ipoint& nearest) const{

		if(radius == 1){
			search_quad(cx - radius,cy - radius, p, nearest_distance, nearest);
			search_quad(cx - radius,cy, p, nearest_distance, nearest);
			search_quad(cx - radius,cy + radius, p, nearest_distance, nearest);
			search_quad(cx,cy - radius, p, nearest_distance, nearest);
			search_quad(cx,cy, p, nearest_distance, nearest);
			search_quad(cx,cy + radius, p, nearest_distance, nearest);
			search_quad(cx + radius,cy - radius, p, nearest_distance, nearest);
			search_quad(cx + radius,cy, p, nearest_distance, nearest);
			search_quad(cx + radius,cy + radius, p, nearest_distance, nearest);
			return;
		}

		int f = 1 - radius;
		int ddF_x = 0;
		int ddF_y = -2 * radius;
		int x = 0;
		int y = radius;
	 
		search_quad(cx,cy + radius, p, nearest_distance, nearest);
		search_quad(cx,cy - radius, p, nearest_distance, nearest);
		search_quad(cx + radius,cy, p, nearest_distance, nearest);
		search_quad(cx - radius,cy, p, nearest_distance, nearest);
	 
		while(x < y) 
		{
		    if(f >= 0) 
		    {
		        y--;
		        ddF_y += 2;
		        f += ddF_y;
		    }else{
			    x++;
				ddF_x += 2;
				f += ddF_x + 1;    
			}
    		search_quad(cx + x,cy + y, p, nearest_distance, nearest);
    		search_quad(cx - x,cy + y, p, nearest_distance, nearest);
    		search_quad(cx + x,cy - y, p, nearest_distance, nearest);
    		search_quad(cx - x,cy - y, p, nearest_distance, nearest);
    		search_quad(cx + y,cy + x, p, nearest_distance, nearest);
    		search_quad(cx - y,cy + x, p, nearest_distance, nearest);
    		search_quad(cx + y,cy - x, p, nearest_distance, nearest);
    		search_quad(cx - y,cy - x, p, nearest_distance, nearest);
		}
	}*/

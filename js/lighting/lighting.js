
function coslight(va, vb){
	var d = mag3(va.x,va.y,va.z) * mag3(vb.x,vb.y,vb.z);
	return dot3(va.x,va.y,va.z,vb.x,vb.y,vb.z)/d;
}


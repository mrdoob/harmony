function Palette()
{
	var canvas, context, offsetx, offsety, inner_radius = 0, outter_radius = 90, count = 1080 / 2, shades = 30,
	segment, degreesToRadians = Math.PI / 180,
	i, j, c, angle, shade;
	
	canvas = document.createElement("canvas");
	canvas.width = 250;
	canvas.height = 250;
	
	offsetx = canvas.width / 2;
	offsety = canvas.height / 2;	
	segment = (outter_radius - inner_radius) / shades;	
	
	context = canvas.getContext("2d");
	context.lineWidth = 3;
	
	function HSB2RGB(hue, sat, val)
	{
		var red, green, blue,
		i, f, p, q, t;

		if (val == 0)
			return [ 0, 0, 0 ];
		
		hue /= 60;
		sat /= 100;
		val /= 100;
			
		i = Math.floor(hue);
		f = hue - i;
		p = val * (1 - sat);
		q = val * (1 - (sat * f));
		t = val * (1 - (sat * (1 - f)));
		
		switch(i)
		{
			case 0: red = val; green = t; blue = p; break;
			case 1: red = q; green = val; blue = p; break;
			case 2: red = p; green = val; blue = t; break;
			case 3: red = p; green = q; blue = val; break;
			case 4: red = t; green = p; blue = val; break;
			case 5: red = val; green = p; blue = q; break;
		}
		
		return [red, green, blue];
	}
	
	// http://www.boostworthy.com/blog/?p=226	
	
	for(i = 0; i < count; i++)
	{
		c = HSB2RGB( Math.floor( (i / count) * 360 ), 100, 100);
		angle = i / (count / 360) * degreesToRadians;
		
		for (j = 0; j < shades; j++)
		{
			shade = 255 - (j / shades) * 255;
			
			context.strokeStyle = "rgb(" + Math.floor( c[0] * 255 + shade ) + "," + Math.floor( c[1] * 255 + shade ) + "," + Math.floor( c[2] * 255 + shade ) + ")";
			context.beginPath();
			context.moveTo(Math.cos(angle) * (segment * j + inner_radius) + offsetx, Math.sin(angle) * (segment * j + inner_radius) + offsety);
			context.lineTo(Math.cos(angle) * (segment * (j + 1) + inner_radius) + offsetx, Math.sin(angle) * (segment * (j + 1) + inner_radius) + offsety);
			context.stroke();
		}
	}
	
	return canvas;
}
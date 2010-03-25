function Palette()
{
	var canvas, context, offsetx, offsety, radius = 90,
	count = 1080, oneDivCount = 1 / count, countDiv360 = count / 360, degreesToRadians = Math.PI / 180,
	i, color, angle, angle_cos, angle_sin, gradient;
	
	canvas = document.createElement("canvas");
	canvas.width = 250;
	canvas.height = 250;
	
	offsetx = canvas.width / 2;
	offsety = canvas.height / 2;
	
	context = canvas.getContext("2d");
	context.lineWidth = 1;
	
	function HSB2RGB(hue, sat, val)
	{
		var red, green, blue,
		i, f, p, q, t;

		if (val == 0)
			return [ 0, 0, 0 ];
		
		hue *= 0.016666667; // /= 60;
		sat *= 0.01; // /= 100;
		val *= 0.01; // /= 100;
			
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
		color = HSB2RGB( Math.floor( (i * oneDivCount) * 360 ), 100, 100);
		angle = i / countDiv360 * degreesToRadians;
		angle_cos = Math.cos(angle);
		angle_sin = Math.sin(angle);
		
		context.strokeStyle = "rgb(" + Math.floor( color[0] * 255 ) + "," + Math.floor( color[1] * 255 ) + "," + Math.floor( color[2] * 255 ) + ")";
		context.beginPath();
		context.moveTo(angle_cos + offsetx, angle_sin + offsety);
		context.lineTo(angle_cos * radius + offsetx, angle_sin * radius + offsety);
		context.stroke();
	}
	
	gradient = context.createRadialGradient(offsetx, offsetx, 0, offsetx, offsetx, radius);
	gradient.addColorStop(0.1, 'rgba(255, 255, 255, 1)');
	gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
	
	context.fillStyle = gradient;
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	return canvas;
}

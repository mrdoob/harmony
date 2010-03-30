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

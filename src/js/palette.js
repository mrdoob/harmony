function Palette()
{
	const DPR = Math.round(window.devicePixelRatio);

	var canvas, context, radius = 90, gradient;

	canvas = document.createElement("canvas");
	canvas.width = 250 * DPR;
	canvas.height = 250 * DPR;

	context = canvas.getContext("2d");
	context.scale(DPR, DPR);

	gradient = context.createConicGradient(0, 125, 125);

	for(hue = 0; hue < 360; hue++)
	{
		gradient.addColorStop(hue / 360, 'hsl(' + hue + ', 100%, 50%)');
	}

	context.beginPath();
	context.arc(125, 125, radius, 0, Math.PI * 2);
	context.fillStyle = gradient;
	context.fill();

	gradient = context.createRadialGradient(125, 125, 0, 125, 125, radius);
	gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
	gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

	context.beginPath();
	context.arc(125, 125, radius, 0, Math.PI * 2);
	context.fillStyle = gradient;
	context.fill();

	return canvas;
}

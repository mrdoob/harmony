function ColorSelector( gradient )
{
	this.init( gradient );
}

ColorSelector.prototype =
{
	container: null,

	hue: null,
	hueSelector: null,
	hueData: null,
	
	luminosity: null,
	luminositySelector: null,
	luminosityData: null,
	luminosityPosition: null,
	
	init: function(gradient)
	{
		var context;

		this.container = document.createElement("div");
		this.container.style.position = 'absolute';
		this.container.style.width = '250px';
		this.container.style.height = '250px';
		this.container.style.visibility = 'hidden';
		this.container.style.cursor = 'pointer';

		this.hue = document.createElement("canvas");
		this.hue.width = gradient.width;
		this.hue.height = gradient.height;
		
		context = this.hue.getContext("2d");
		context.drawImage(gradient, 0, 0);

		this.hueData = context.getImageData(0, 0, this.hue.width, this.hue.height).data;	
		
		this.container.appendChild(this.hue);
		
		this.luminosity = document.createElement("canvas");
		this.luminosity.style.position = 'absolute';
		this.luminosity.style.left = '0px';
		this.luminosity.style.top = '0px';
		this.luminosity.width = 250;
		this.luminosity.height = 250;

		this.container.appendChild(this.luminosity);

		this.updateLuminosity( [255, 255, 255] );
		
		this.hueSelector = document.createElement("canvas");
		this.hueSelector.style.position = 'absolute';
		this.hueSelector.style.left = ((this.hue.width - 15) / 2 ) + 'px';
		this.hueSelector.style.top = ((this.hue.height - 15) / 2 ) + 'px';
		this.hueSelector.width = 15;
		this.hueSelector.height = 15;
		
		context = this.hueSelector.getContext("2d");
		context.lineWidth = 2;
		context.strokeStyle = "rgba(0, 0, 0, 0.5)";
		context.beginPath();
		context.arc(8, 8, 6, 0, Math.PI * 2, true);
		context.stroke();
		context.strokeStyle = "rgba(256, 256, 256, 0.8)";
		context.beginPath();
		context.arc(7, 7, 6, 0, Math.PI * 2, true);
		context.stroke();

		this.container.appendChild(this.hueSelector);
		
		this.luminosityPosition = [	(gradient.width - 15), (gradient.height - 15) / 2 ];
		
		this.luminositySelector = document.createElement("canvas");
		this.luminositySelector.style.position = 'absolute';
		this.luminositySelector.style.left = (this.luminosityPosition[0] - 7) + 'px';
		this.luminositySelector.style.top = (this.luminosityPosition[1] - 7) + 'px';
		this.luminositySelector.width = 15;
		this.luminositySelector.height = 15;
		
		context = this.luminositySelector.getContext("2d");
		context.drawImage(this.hueSelector, 0, 0);
		
		this.container.appendChild(this.luminositySelector);
	},
	
	show: function()
	{
		this.container.style.visibility = 'visible';
	},
	
	hide: function()
	{
		this.container.style.visibility = 'hidden';		
	},
	
	updateLuminosity: function( color )
	{
		var context, angle, shade, offsetx, offsety,
		inner_radius = 100, outter_radius = 120, i, count = 1080 / 2, degreesToRadians = Math.PI / 180;
		
		offsetx = this.luminosity.width / 2;
		offsety = this.luminosity.height / 2;
		
		context = this.luminosity.getContext("2d");
		context.lineWidth = 3;
		context.clearRect(0, 0, this.luminosity.width, this.luminosity.height);
		
		for(i = 0; i < count; i++)
		{
			angle = i / (count / 360) * degreesToRadians;

			shade = 255 - (i / count) * 255;
			
			context.strokeStyle = "rgb(" + Math.floor( color[0] - shade ) + "," + Math.floor( color[1] - shade ) + "," + Math.floor( color[2] - shade ) + ")";
			context.beginPath();
			context.moveTo(Math.cos(angle) * inner_radius + offsetx, Math.sin(angle) * inner_radius + offsety);
			context.lineTo(Math.cos(angle) * outter_radius + offsetx, Math.sin(angle) * outter_radius + offsety);
			context.stroke();
		}
		
		this.luminosityData = context.getImageData(0, 0, this.luminosity.width, this.luminosity.height).data;
	},
	
	update: function()
	{
		var x, y, dx, dy, d, nx, ny;
		
		x = (mouseX - this.container.offsetLeft);
		y = (mouseY - this.container.offsetTop);
		
		dx = x - 125;
		dy = y - 125;
		d = Math.sqrt( dx * dx + dy * dy );

		if (d < 90)
		{
			this.hueSelector.style.left = (x - 7) + 'px';
			this.hueSelector.style.top = (y - 7) + 'px';
			this.updateLuminosity( [ this.hueData[(x + (y * 250)) * 4], this.hueData[(x + (y * 250)) * 4 + 1], this.hueData[(x + (y * 250)) * 4 + 2] ] );
		}
		else if (d > 100)
		{
			nx = dx / d;
			ny = dy / d;
			
			this.luminosityPosition[0] = (nx * 110) + 125;
			this.luminosityPosition[1] = (ny * 110) + 125;
			
			this.luminositySelector.style.left = ( this.luminosityPosition[0] - 7) + 'px';
			this.luminositySelector.style.top = ( this.luminosityPosition[1] - 7) + 'px';			
		}
	},
	
	getColor: function()
	{
		var x, y;
		
		x = Math.floor(this.luminosityPosition[0]);
		y = Math.floor(this.luminosityPosition[1]);
		
		return [ this.luminosityData[(x + (y * 250)) * 4], this.luminosityData[(x + (y * 250)) * 4 + 1], this.luminosityData[(x + (y * 250)) * 4 + 2] ];
	}
}

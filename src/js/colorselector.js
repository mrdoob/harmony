function ColorSelector( gradient )
{
	this.init( gradient );
}

ColorSelector.prototype =
{
	container: null,
	color: [255, 0, 0],

	dispatcher: null,
	changeEvent: null,
	
	init: function(gradient)
	{
		var scope = this, context, hue, hueSelector, hueData,
		luminosity, luminositySelector, luminosityData, luminosityPosition;

		this.container = document.createElement('div');
		this.container.style.position = 'absolute';
		this.container.style.width = '250px';
		this.container.style.height = '250px';
		this.container.style.visibility = 'hidden';
		this.container.style.cursor = 'pointer';
		this.container.addEventListener('mousedown', onMouseDown, false);
		this.container.addEventListener('touchstart', onTouchStart, false);

		hue = document.createElement("canvas");
		hue.width = gradient.width;
		hue.height = gradient.height;
		
		context = hue.getContext("2d");
		context.drawImage(gradient, 0, 0, hue.width, hue.height);

		hueData = context.getImageData(0, 0, hue.width, hue.height).data;	
		
		this.container.appendChild(hue);
		
		luminosity = document.createElement("canvas");
		luminosity.style.position = 'absolute';
		luminosity.style.left = '0px';
		luminosity.style.top = '0px';
		luminosity.width = 250;
		luminosity.height = 250;

		this.container.appendChild(luminosity);

		hueSelector = document.createElement("canvas");
		hueSelector.style.position = 'absolute';
		hueSelector.style.left = ((hue.width - 15) / 2 ) + 'px';
		hueSelector.style.top = ((hue.height - 15) / 2 ) + 'px';
		hueSelector.width = 15;
		hueSelector.height = 15;
		
		context = hueSelector.getContext("2d");
		context.lineWidth = 2;
		context.strokeStyle = "rgba(0, 0, 0, 0.5)";
		context.beginPath();
		context.arc(8, 8, 6, 0, Math.PI * 2, true);
		context.stroke();
		context.strokeStyle = "rgba(256, 256, 256, 0.8)";
		context.beginPath();
		context.arc(7, 7, 6, 0, Math.PI * 2, true);
		context.stroke();

		this.container.appendChild( hueSelector );
		
		luminosityPosition = [ (gradient.width - 15), (gradient.height - 15) / 2 ];
		
		luminositySelector = document.createElement("canvas");
		luminositySelector.style.position = 'absolute';
		luminositySelector.style.left = (luminosityPosition[0] - 7) + 'px';
		luminositySelector.style.top = (luminosityPosition[1] - 7) + 'px';
		luminositySelector.width = 15;
		luminositySelector.height = 15;
		
		context = luminositySelector.getContext("2d");
		context.drawImage(hueSelector, 0, 0, luminositySelector.width, luminositySelector.height);
		
		this.container.appendChild(luminositySelector);
		
		this.dispatcher = document.createElement('div'); // There must be a cleaner way...
		
		this.changeEvent = document.createEvent('Events');
		this.changeEvent.initEvent('change', true, true);
		
		//
		
		function onMouseDown( event )
		{
			window.addEventListener('mousemove', onMouseMove, false);
			window.addEventListener('mouseup', onMouseUp, false);
			
			update( event.clientX - scope.container.offsetLeft, event.clientY - scope.container.offsetTop );
		}
		
		function onMouseMove( event )
		{
			update( event.clientX - scope.container.offsetLeft, event.clientY - scope.container.offsetTop );
		}

		function onMouseUp( event )
		{
			window.removeEventListener('mousemove', onMouseMove, false);
			window.removeEventListener('mouseup', onMouseUp, false);
		
			update( event.clientX - scope.container.offsetLeft, event.clientY - scope.container.offsetTop );
		}
		
		function onTouchStart( event )
		{
			if(event.touches.length == 1)
			{
				event.preventDefault();

				window.addEventListener('touchmove', onTouchMove, false);
				window.addEventListener('touchend', onTouchEnd, false);
		
				update( event.touches[0].pageX - scope.container.offsetLeft, event.touches[0].pageY - scope.container.offsetTop );
			}
		}

		function onTouchMove( event )
		{
			if(event.touches.length == 1)
			{
				event.preventDefault();
			
				update( event.touches[0].pageX - scope.container.offsetLeft, event.touches[0].pageY - scope.container.offsetTop );
			}
		}

		function onTouchEnd( event )
		{
			if(event.touches.length == 0)
			{
				event.preventDefault();
			
				window.removeEventListener('touchmove', onTouchMove, false);
				window.removeEventListener('touchend', onTouchEnd, false);
			}
		}
		
		//
		
		function updateLuminosity( color )
		{
			var context, angle, angle_cos, angle_sin, shade, offsetx, offsety,
			inner_radius = 100, outter_radius = 120, i, count = 1080 / 2, oneDivCount = 1 / count, degreesToRadians = Math.PI / 180,
			countDiv360 = (count / 360),
			x, y;
		
			offsetx = luminosity.width / 2;
			offsety = luminosity.height / 2;
		
			context = luminosity.getContext("2d");
			context.lineWidth = 3;
			context.clearRect(0, 0, luminosity.width, luminosity.height);
		
			for(i = 0; i < count; i++)
			{
				angle = i / countDiv360 * degreesToRadians;
				angle_cos = Math.cos(angle);
				angle_sin = Math.sin(angle);

				shade = 255 - (i * oneDivCount /* / count */) * 255;
			
				context.strokeStyle = "rgb(" + Math.floor( color[0] - shade ) + "," + Math.floor( color[1] - shade ) + "," + Math.floor( color[2] - shade ) + ")";
				context.beginPath();
				context.moveTo(angle_cos * inner_radius + offsetx, angle_sin * inner_radius + offsety);
				context.lineTo(angle_cos * outter_radius + offsetx, angle_sin * outter_radius + offsety);
				context.stroke();
			}
		
			luminosityData = context.getImageData(0, 0, luminosity.width, luminosity.height).data;
		}
	
		function update(x, y)
		{
			var dx, dy, d, nx, ny;
		
			dx = x - 125;
			dy = y - 125;
			d = Math.sqrt( dx * dx + dy * dy );

			if (d < 90)
			{
				hueSelector.style.left = (x - 7) + 'px';
				hueSelector.style.top = (y - 7) + 'px';
				updateLuminosity( [ hueData[(x + (y * 250)) * 4], hueData[(x + (y * 250)) * 4 + 1], hueData[(x + (y * 250)) * 4 + 2] ] );
			}
			else if (d > 100)
			{
				nx = dx / d;
				ny = dy / d;
			
				luminosityPosition[0] = (nx * 110) + 125;
				luminosityPosition[1] = (ny * 110) + 125;
			
				luminositySelector.style.left = ( luminosityPosition[0] - 7) + 'px';
				luminositySelector.style.top = ( luminosityPosition[1] - 7) + 'px';
			}
			
			x = Math.floor(luminosityPosition[0]);
			y = Math.floor(luminosityPosition[1]);
		
			scope.color[0] = luminosityData[(x + (y * 250)) * 4];
			scope.color[1] = luminosityData[(x + (y * 250)) * 4 + 1];
			scope.color[2] = luminosityData[(x + (y * 250)) * 4 + 2];			
		
			scope.dispatchEvent( scope.changeEvent );
		}	
	},
	
	
	//
	
	show: function()
	{
		this.container.style.visibility = 'visible';
	},
	
	hide: function()
	{
		this.container.style.visibility = 'hidden';		
	},
	
	getColor: function()
	{
		return this.color;
	},
	
	setColor: function( color )
	{
		// TODO
	},
	
	
	//
	
	addEventListener: function( type, listener, useCapture )
	{
		this.dispatcher.addEventListener(type, listener, useCapture);
	},
	
	dispatchEvent: function( event )
	{
		this.dispatcher.dispatchEvent(event);
	},
	
	removeEventListener: function( type, listener, useCapture )
	{
		this.dispatcher.removeEventListener(type, listener, useCapture);
	}
}

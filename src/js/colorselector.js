function ColorSelector( gradient )
{
	this.init( gradient );
}

ColorSelector.prototype =
{
	container: null,
	color: [0, 0, 0],

	hueSelector: null,
	luminosity: null,
	luminosityData: null,
	luminositySelector: null,
	luminosityPosition: null,

	dispatcher: null,
	changeEvent: null,

	init: function( gradient )
	{
		const DPR = Math.round( window.devicePixelRatio );

		var scope = this, context, hue, hueData;

		this.container = document.createElement('div');
		this.container.style.position = 'absolute';
		this.container.style.width = '250px';
		this.container.style.height = '250px';
		this.container.style.visibility = 'hidden';
		this.container.style.cursor = 'pointer';
		this.container.style.clipPath = 'circle(50.0% at 50% 50%)';
		this.container.addEventListener('mousedown', onMouseDown, false);
		this.container.addEventListener('touchstart', onTouchStart, false);

		hue = document.createElement("canvas");
		hue.width = 250 * DPR;
		hue.height = 250 * DPR;
		hue.style.width = '250px';
		hue.style.height = '250px';

		context = hue.getContext("2d");
		context.drawImage(gradient, 0, 0, hue.width, hue.height);

		hueData = context.getImageData(0, 0, hue.width, hue.height).data;

		this.container.appendChild(hue);

		this.luminosity = document.createElement("canvas");
		this.luminosity.style.position = 'absolute';
		this.luminosity.style.left = '0px';
		this.luminosity.style.top = '0px';
		this.luminosity.width = 250 * DPR;
		this.luminosity.height = 250 * DPR;
		this.luminosity.style.width = '250px';
		this.luminosity.style.height = '250px';

		context = this.luminosity.getContext("2d");
		context.scale(DPR, DPR);
		context.translate(250 / 2, 250 / 2);

		this.container.appendChild(this.luminosity);

		this.hueSelector = document.createElement("canvas");
		this.hueSelector.style.position = 'absolute';
		this.hueSelector.style.left = ((hue.width - 15) / 2 ) + 'px';
		this.hueSelector.style.top = ((hue.height - 15) / 2 ) + 'px';
		this.hueSelector.width = 15 * DPR;
		this.hueSelector.height = 15 * DPR;
		this.hueSelector.style.width = '15px';
		this.hueSelector.style.height = '15px';

		context = this.hueSelector.getContext("2d");
		context.scale(DPR, DPR);
		context.lineWidth = 2;
		context.strokeStyle = "rgba(0, 0, 0, 0.5)";
		context.beginPath();
		context.arc(8, 8, 6, 0, Math.PI * 2, true);
		context.stroke();
		context.strokeStyle = "rgba(256, 256, 256, 0.8)";
		context.beginPath();
		context.arc(7, 7, 6, 0, Math.PI * 2, true);
		context.stroke();

		this.container.appendChild( this.hueSelector );

		this.luminosityPosition = [ (gradient.width - 15), (gradient.height - 15) / 2 ];

		this.luminositySelector = document.createElement("canvas");
		this.luminositySelector.style.position = 'absolute';
		this.luminositySelector.style.left = (this.luminosityPosition[0] - 7) + 'px';
		this.luminositySelector.style.top = (this.luminosityPosition[1] - 7) + 'px';
		this.luminositySelector.width = 15 * DPR;
		this.luminositySelector.height = 15 * DPR;
		this.luminositySelector.style.width = '15px';
		this.luminositySelector.style.height = '15px';

		context = this.luminositySelector.getContext("2d");
		context.drawImage(this.hueSelector, 0, 0, this.luminositySelector.width, this.luminositySelector.height);

		this.container.appendChild(this.luminositySelector);

		this.dispatcher = document.createElement('div'); // this could be better handled...

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

		function update(x, y)
		{
			var dx, dy, d, nx, ny;

			dx = x - 125;
			dy = y - 125;
			d = Math.sqrt( dx * dx + dy * dy );

			if (d < 90)
			{
				scope.hueSelector.style.left = (x - 7) + 'px';
				scope.hueSelector.style.top = (y - 7) + 'px';

				var index = Math.round( (x * DPR) + ((y * DPR) * (250 * DPR)) ) * 4;
				scope.updateLuminosity( hueData[index + 0], hueData[index + 1], hueData[index + 2] );
			}
			else if (d > 100)
			{
				nx = dx / d;
				ny = dy / d;

				scope.luminosityPosition[0] = (nx * 110) + 125;
				scope.luminosityPosition[1] = (ny * 110) + 125;

				scope.luminositySelector.style.left = ( scope.luminosityPosition[0] - 7) + 'px';
				scope.luminositySelector.style.top = ( scope.luminosityPosition[1] - 7) + 'px';
			}

			x = Math.floor(scope.luminosityPosition[0]);
			y = Math.floor(scope.luminosityPosition[1]);

			var index = ((x * DPR) + ((y * DPR) * (250 * DPR))) * 4;
			scope.color[0] = scope.luminosityData[index + 0];
			scope.color[1] = scope.luminosityData[index + 1];
			scope.color[2] = scope.luminosityData[index + 2];

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
		// Ok, this is super dirty. The whole class needs some refactoring, again! :/

		var hsb, angle, distance, rgb, DEG2RAD = Math.PI / 180;

		this.color = color;

		hsb = RGB2HSB(color[0] / 255, color[1] / 255, color[2] / 255);

		angle = hsb[0] * DEG2RAD;
		distance = (hsb[1] / 100) * 90;

		this.hueSelector.style.left = ( ( Math.cos(angle) * distance + 125 ) - 7 ) + 'px';
		this.hueSelector.style.top = ( ( Math.sin(angle) * distance + 125 ) - 7 ) + 'px';

		rgb = HSB2RGB(hsb[0], hsb[1], 100);
		rgb[0] *= 255; rgb[1] *= 255; rgb[2] *= 255;

		this.updateLuminosity( rgb[0], rgb[1], rgb[2] );

		angle = (hsb[2] / 100) * 360 * DEG2RAD;

		this.luminosityPosition[0] = ( Math.cos(angle) * 110 ) + 125;
		this.luminosityPosition[1] = ( Math.sin(angle) * 110 ) + 125;

		this.luminositySelector.style.left = ( this.luminosityPosition[0] - 7 ) + 'px';
		this.luminositySelector.style.top = ( this.luminosityPosition[1] - 7 ) + 'px';

		this.dispatchEvent( this.changeEvent );
	},

	//

	updateLuminosity: function( r, g, b )
	{
		var context, angle, angle_cos, angle_sin, shade, radius = 110,
		i, count = 360, DEG2RAD = Math.PI / 180;

		context = this.luminosity.getContext("2d");
		context.clearRect(0, 0, this.luminosity.width, this.luminosity.height);

		const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

		for(i = 0; i < count; i++)
		{
			angle = map( i, 0, count, 5, 355 ) * DEG2RAD;
			angle_cos = Math.cos(angle);
			angle_sin = Math.sin(angle);

			shade = i / count;

			context.fillStyle = "rgb(" + Math.floor( r * shade ) + "," + Math.floor( g * shade ) + "," + Math.floor( b * shade ) + ")";
			context.beginPath();
			context.arc(angle_cos * radius, angle_sin * radius, 10, 0, Math.PI * 2);
			context.fill();

		}

		this.luminosityData = context.getImageData(0, 0, this.luminosity.width, this.luminosity.height).data;
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

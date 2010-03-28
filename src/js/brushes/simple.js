function simple( context )
{
	this.init( context );
}

simple.prototype =
{
	context: null,

	prevMouseX: null, prevMouseY: null,

	init: function( context )
	{
		this.context = context;
		this.context.globalCompositeOperation = 'source-over';
		this.context.lineWidth = 0.5;
	},

	destroy: function()
	{
	},

	strokeStart: function( mouseX, mouseY )
	{
		this.prevMouseX = mouseX;
		this.prevMouseY = mouseY;
		
		this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", 0.5)";		
	},

	stroke: function( mouseX, mouseY )
	{
		this.context.beginPath();
		this.context.moveTo(this.prevMouseX, this.prevMouseY);
		this.context.lineTo(mouseX, mouseY);
		this.context.stroke();

		this.prevMouseX = mouseX;
		this.prevMouseY = mouseY;
	},

	strokeEnd: function()
	{
		
	}
}

function squares( context )
{
	this.init( context );
}

squares.prototype =
{
	context: null,

	prevMouseX: null, prevMouseY: null,

	init: function( context )
	{
		this.context = context;
		this.context.globalCompositeOperation = 'source-over';
		this.context.fillStyle = "rgb(255, 255, 255)";
		this.context.lineWidth = 1;
	},

	destroy: function()
	{
	},

	strokeStart: function( mouseX, mouseY )
	{
		this.prevMouseX = mouseX;
		this.prevMouseY = mouseY;
		
		this.context.strokeStyle = "rgb(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ")";		
	},

	stroke: function( mouseX, mouseY )
	{
		var dx, dy, angle, px, py;
		
		dx = mouseX - this.prevMouseX;
		dy = mouseY - this.prevMouseY;
		angle = 1.57079633;
		px = Math.cos(angle) * dx - Math.sin(angle) * dy;
		py = Math.sin(angle) * dx + Math.cos(angle) * dy;

		this.context.beginPath();
		this.context.moveTo(this.prevMouseX - px, this.prevMouseY - py);
		this.context.lineTo(this.prevMouseX + px, this.prevMouseY + py);
		this.context.lineTo(mouseX + px, mouseY + py);
		this.context.lineTo(mouseX - px, mouseY - py);
		this.context.lineTo(this.prevMouseX - px, this.prevMouseY - py);
		this.context.fill();
		this.context.stroke();

		this.prevMouseX = mouseX;
		this.prevMouseY = mouseY;
	},

	strokeEnd: function()
	{
		
	}
}

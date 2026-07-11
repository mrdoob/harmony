function About()
{
	this.init();
}

About.prototype =
{
	container: null,

	init: function()
	{
		var scope = this, text, closeButton;

		this.container = document.createElement("div");
		this.container.className = 'about-panel';
		this.container.style.position = 'absolute';
		this.container.style.top = '0px';
		this.container.style.visibility = 'hidden';

		text = document.createElement("h1");
		text.innerHTML = 'Harmony';
		this.container.appendChild(text);

		text = document.createElement("p");
		text.className = 'sub';
		text.innerHTML = '<a href="changelog.txt" target="_blank">r' + REV + '</a> by <a href="http://twitter.com/mrdoob" target="_blank">Mr.doob</a>';
		this.container.appendChild(text);

		text = document.createElement("h3");
		text.innerHTML = 'Shortcuts';
		this.container.appendChild(text);

		text = document.createElement("div");
		text.className = 'kbd-row';
		text.innerHTML =
			'<span><span class="key">d</span> <span class="key">f</span> brush size</span>' +
			'<span><span class="key">r</span> reset brush</span>' +
			'<span><span class="key">shift</span> colour wheel</span>' +
			'<span><span class="key">alt</span> eyedropper</span>' +
			'<span><span class="key">ctrl</span> + scroll to zoom</span>';
		this.container.appendChild(text);

		text = document.createElement("hr");
		this.container.appendChild(text);

		text = document.createElement("p");
		text.innerHTML = '<em>Sketchy</em>, <em>Shaded</em>, <em>Chrome</em>, <em>Fur</em>, <em>LongFur</em> and <em>Web</em> are all variations of the neighbour points connection concept, first implemented in <a href="http://www.zefrank.com/scribbler/" target="_blank">The Scribbler</a>.';
		this.container.appendChild(text);

		text = document.createElement("p");
		text.style.textAlign = 'center';
		text.innerHTML = '<a href="http://mrdoob.com/blog/post/689" target="_blank">Info</a> &nbsp;·&nbsp; <a href="http://github.com/mrdoob/harmony" target="_blank">Source Code</a>';
		this.container.appendChild(text);

		text = document.createElement("hr");
		this.container.appendChild(text);

		text = document.createElement("p");
		text.style.textAlign = 'center';
		text.innerHTML = 'If you like the tool, you can use this button to share your love ;)';
		this.container.appendChild(text);

		text = document.createElement("p");
		text.style.textAlign = 'center';
		text.style.margin = '10px 0 0';
		text.innerHTML = '<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" style="margin:0"><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="VY7767JMMMYM4"><input type="image" src="https://www.paypal.com/en_GB/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online."><img alt="" border="0" src="https://www.paypal.com/en_GB/i/scr/pixel.gif" width="1" height="1"></form>';
		this.container.appendChild(text);

		closeButton = document.createElement("button");
		closeButton.type = 'button';
		closeButton.className = 'about-close';
		closeButton.innerHTML = 'Close';
		closeButton.addEventListener('click', function()
		{
			scope.hide();
			isAboutVisible = false;
		}, false);
		this.container.appendChild(closeButton);
	},

	show: function()
	{
		this.container.style.visibility = 'visible';
	},

	hide: function()
	{
		this.container.style.visibility = 'hidden';
	}
}

var ICON =
{
	trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg>',
	more:  '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18" cy="12" r="1.7"/></svg>',
	save:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
	info:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="17"/><circle cx="12" cy="8" r="0.9" fill="currentColor"/></svg>',
	theme:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
	upload:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
	download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
	warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.9" fill="currentColor"/></svg>',
	grip:    '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/></svg>'
};

function Menu()
{
	this.init();
}

Menu.prototype =
{
	container: null,
	overflowPanel: null,
	dragHandle: null,
	moved: false,

	zoomPill: null,

	foregroundColor: null,
	backgroundColor: null,

	selector: null,
	sizeSlider: null,
	sizeVal: null,
	save: null,
	clear: null,
	about: null,
	background: null,
	download: null,
	upload: null,
	fileInput: null,
	themeSelector: null,
	moreBtn: null,

	isOverflowOpen: false,

	init: function()
	{
		var scope = this, option, ti, themeOption;
		var themeOptions = [
			{ label: 'Auto',  value: 'auto'  },
			{ label: 'Light', value: 'light' },
			{ label: 'Dark',  value: 'dark'  }
		];

		// ── Toolbar pill: [ colour ] [ brush ] [ save ] | [ clear ] [ ⋯ ] ──
		this.container = document.createElement("div");
		this.container.className = 'gui';
		this.container.style.position = 'absolute';
		this.container.style.top = '10px';

		this.dragHandle = document.createElement("div");
		this.dragHandle.className = 'drag-handle';
		this.dragHandle.title = 'Move toolbar';
		this.dragHandle.innerHTML = ICON.grip;
		this.container.appendChild(this.dragHandle);

		this.foregroundColor = document.createElement("canvas");
		this.foregroundColor.className = 'swatch';
		this.foregroundColor.width = 24;
		this.foregroundColor.height = 24;
		this.foregroundColor.title = 'Colour';
		this.container.appendChild(this.foregroundColor);
		this.setForegroundColor( COLOR );

		this.selector = document.createElement("select");
		this.selector.className = 'pill';
		for (i = 0; i < BRUSHES.length; i++)
		{
			option = document.createElement("option");
			option.id = i;
			option.innerHTML = BRUSHES[i].toUpperCase();
			this.selector.appendChild(option);
		}
		this.container.appendChild(this.selector);

		// Brush size
		this.sizeSlider = document.createElement("input");
		this.sizeSlider.type = 'range';
		this.sizeSlider.className = 'size-range';
		this.sizeSlider.min = '1';
		this.sizeSlider.max = '50';
		this.sizeSlider.step = '1';
		this.sizeSlider.title = 'Brush size';
		this.sizeVal = document.createElement("span");
		this.sizeVal.className = 'size-val';
		var sizeCell = document.createElement("div");
		sizeCell.className = 'size-cell';
		sizeCell.appendChild(this.sizeSlider);
		sizeCell.appendChild(this.sizeVal);
		this.container.appendChild(sizeCell);
		this.setBrushSize( BRUSH_SIZE );

		// Zoom indicator (ctrl + scroll to zoom; click to reset)
		this.zoomPill = document.createElement("button");
		this.zoomPill.type = 'button';
		this.zoomPill.className = 'zoom-pill';
		this.zoomPill.title = 'Reset zoom';
		this.zoomPill.textContent = '100%';
		this.container.appendChild(this.zoomPill);

		this.save = this.iconButton(ICON.save, 'Save');
		this.container.appendChild(this.save);

		this.container.appendChild(this.divider());

		this.clear = this.iconButton(ICON.trash, 'Clear');
		this.clear.classList.add('danger');
		this.container.appendChild(this.clear);

		this.moreBtn = this.iconButton(ICON.more, 'More');
		this.container.appendChild(this.moreBtn);

		this.about = this.iconButton(ICON.info, 'About');
		this.container.appendChild(this.about);

		// ── Overflow (⋯) panel: Theme · Background · About ──
		this.overflowPanel = document.createElement("div");
		this.overflowPanel.className = 'overflow-panel';

		// Theme selector
		this.themeSelector = document.createElement("select");
		this.themeSelector.className = 'pill';
		for (ti = 0; ti < themeOptions.length; ti++)
		{
			themeOption = document.createElement("option");
			themeOption.value = themeOptions[ti].value;
			themeOption.textContent = themeOptions[ti].label;
			this.themeSelector.appendChild(themeOption);
		}
		this.themeSelector.value = themeGet();
		this.themeSelector.addEventListener('change', function()
		{
			themeSet(scope.themeSelector.value);
		}, false);
		var themeRow = this.controlRow(ICON.theme, 'Theme', this.themeSelector);

		// Background colour (opens the background colour wheel, as before)
		this.backgroundColor = document.createElement("canvas");
		this.backgroundColor.width = 18;
		this.backgroundColor.height = 18;
		var bgIcon = document.createElement("span");
		bgIcon.className = 'ovr-icon';
		bgIcon.appendChild(this.backgroundColor);
		this.background = document.createElement("button");
		this.background.type = 'button';
		this.background.className = 'overflow-row';
		this.background.appendChild(bgIcon);
		var bgLabel = document.createElement("span");
		bgLabel.className = 'ovr-label';
		bgLabel.textContent = 'Background';
		this.background.appendChild(bgLabel);
		this.setBackgroundColor( BACKGROUND_COLOR );

		var settingsSection = document.createElement("div");
		settingsSection.className = 'overflow-section';
		settingsSection.appendChild(themeRow);
		settingsSection.appendChild(this.background);
		this.overflowPanel.appendChild(settingsSection);

		// Harmony project file (.harmony): download / upload
		this.download = this.actionRow(ICON.download, 'Download .harmony');
		this.upload = this.actionRow(ICON.upload, 'Upload .harmony');
		this.fileInput = document.createElement("input");
		this.fileInput.type = 'file';
		this.fileInput.accept = '.harmony,application/zip';
		this.fileInput.className = 'file-input-hidden';
		document.body.appendChild(this.fileInput);

		var fileSection = document.createElement("div");
		fileSection.className = 'overflow-section';
		fileSection.appendChild(this.download);
		fileSection.appendChild(this.upload);
		this.overflowPanel.appendChild(fileSection);

		document.body.appendChild(this.overflowPanel);

		// ── Overflow open / close wiring ──
		this.moreBtn.addEventListener('click', function(event)
		{
			event.preventDefault();
			event.stopPropagation();
			scope.toggleOverflow();
		}, false);

		// Selecting a row action closes the panel.
		this.background.addEventListener('click', function() { scope.closeOverflow(); }, false);
		this.download.addEventListener('click', function() { scope.closeOverflow(); }, false);
		this.upload.addEventListener('click', function() { scope.closeOverflow(); }, false);

		// Click outside closes the panel.
		document.addEventListener('pointerdown', function(event)
		{
			if (scope.isOverflowOpen &&
			    !scope.overflowPanel.contains(event.target) &&
			    !scope.moreBtn.contains(event.target))
			{
				scope.closeOverflow();
			}
		}, true);

		// Drag the toolbar by its grip handle.
		var dragging = false, startX, startY, startLeft, startTop;

		this.dragHandle.addEventListener('pointerdown', function(event)
		{
			event.preventDefault();
			event.stopPropagation();
			dragging = true;
			scope.moved = true;
			startX = event.clientX;
			startY = event.clientY;
			var rect = scope.container.getBoundingClientRect();
			startLeft = rect.left;
			startTop = rect.top;
			scope.dragHandle.setPointerCapture(event.pointerId);
		}, false);

		this.dragHandle.addEventListener('pointermove', function(event)
		{
			if (!dragging) return;
			var width = scope.container.offsetWidth;
			var height = scope.container.offsetHeight;
			var left = Math.max(4, Math.min(window.innerWidth - width - 4, startLeft + (event.clientX - startX)));
			var top = Math.max(4, Math.min(window.innerHeight - height - 4, startTop + (event.clientY - startY)));
			scope.container.style.left = left + 'px';
			scope.container.style.top = top + 'px';
		}, false);

		this.dragHandle.addEventListener('pointerup', function(event)
		{
			dragging = false;
			if (scope.dragHandle.hasPointerCapture(event.pointerId))
				scope.dragHandle.releasePointerCapture(event.pointerId);
		}, false);
	},

	// ── element helpers ──

	divider: function()
	{
		var d = document.createElement("span");
		d.className = 'gui-divider';
		return d;
	},

	iconButton: function( svg, tip )
	{
		var b = document.createElement("button");
		b.type = 'button';
		b.className = 'btn';
		b.setAttribute('data-tip', tip);
		b.title = tip;
		b.innerHTML = svg;
		return b;
	},

	actionRow: function( svg, label )
	{
		var b = document.createElement("button");
		b.type = 'button';
		b.className = 'overflow-row';
		b.title = label;
		b.innerHTML = '<span class="ovr-icon">' + svg + '</span>' +
		              '<span class="ovr-label">' + label + '</span>';
		return b;
	},

	controlRow: function( svg, label, control )
	{
		var row = document.createElement("div");
		row.className = 'overflow-row with-control';
		row.innerHTML = '<span class="ovr-icon">' + svg + '</span>' +
		                '<span class="ovr-label">' + label + '</span>';
		row.appendChild(control);
		return row;
	},

	// ── overflow state ──

	openOverflow: function()
	{
		var rect = this.moreBtn.getBoundingClientRect();
		var width = 240;
		var left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width));
		this.overflowPanel.style.left = left + 'px';
		this.overflowPanel.style.top = (rect.bottom + 8) + 'px';
		this.overflowPanel.classList.add('open');
		this.isOverflowOpen = true;
	},

	closeOverflow: function()
	{
		this.overflowPanel.classList.remove('open');
		this.isOverflowOpen = false;
	},

	toggleOverflow: function()
	{
		if (this.isOverflowOpen) this.closeOverflow();
		else this.openOverflow();
	},

	// ── brush size ──

	setBrushSize: function( size )
	{
		this.sizeSlider.value = Math.min( size, parseInt(this.sizeSlider.max) );
		this.sizeVal.textContent = size;
	},

	setZoomLevel: function( level )
	{
		this.zoomPill.textContent = Math.round( level * 100 ) + '%';
	},

	// ── colour swatches ──

	setForegroundColor: function( color )
	{
		var context = this.foregroundColor.getContext("2d");
		context.fillStyle = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
		context.fillRect(0, 0, this.foregroundColor.width, this.foregroundColor.height);
	},

	setBackgroundColor: function( color )
	{
		var context = this.backgroundColor.getContext("2d");
		context.fillStyle = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
		context.fillRect(0, 0, this.backgroundColor.width, this.backgroundColor.height);
	}
}

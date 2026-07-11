const REV = 10;
const BRUSHES = ["sketchy", "shaded", "chrome", "fur", "longfur", "web", "", "simple", "squares", "ribbon", "", "circles", "grid"];
const USER_AGENT = navigator.userAgent.toLowerCase();
const ZOOM_MIN = 1;
const ZOOM_MAX = 8;

var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    PIXEL_RATIO = Math.max( 1, window.devicePixelRatio ),
    BRUSH_SIZE = 1,
    BRUSH_PRESSURE = 1,
    COLOR = [0, 0, 0],
    BACKGROUND_COLOR = [250, 250, 250],
    STORAGE = window.localStorage,
    brush,
    saveTimeOut,
    wacom,
    i,
    mouseX = 0,
    mouseY = 0,
    container,
    foregroundColorSelector,
    backgroundColorSelector,
    menu,
    about,
    canvas,
    flattenCanvas,
    context,
    isFgColorSelectorVisible = false,
    isBgColorSelectorVisible = false,
    isAboutVisible = false,
    isMenuMouseOver = false,
    isCanvasDirty = false,
    isModalOpen = false,
    zoomLevel = 1,
    panX = 0,
    panY = 0,
    pinching = false,
    pinchStartDist = 0,
    pinchStartZoom = 1,
    shiftKeyIsDown = false,
    altKeyIsDown = false;

init();

function init()
{
	var hash, palette, embed, localStorageImage;

	themeApply( themeGet() );

	if (USER_AGENT.search("android") > -1 || USER_AGENT.search("iphone") > -1)
		BRUSH_SIZE = 2;

	if (USER_AGENT.search("safari") > -1 && USER_AGENT.search("chrome") == -1) // Safari
		STORAGE = false;

	document.body.style.backgroundRepeat = 'no-repeat';
	document.body.style.backgroundPosition = 'center center';

	container = document.createElement('div');
	document.body.appendChild(container);

	/*
	 * TODO: In some browsers a naste "Plugin Missing" window appears and people is getting confused.
	 * Disabling it until a better way to handle it appears.
	 *
	 * embed = document.createElement('embed');
	 * embed.id = 'wacom-plugin';
	 * embed.type = 'application/x-wacom-tablet';
	 * document.body.appendChild(embed);
	 *
	 * wacom = document.embeds["wacom-plugin"];
	 */

	canvas = document.createElement("canvas");
	canvas.width = SCREEN_WIDTH * PIXEL_RATIO;
	canvas.height = SCREEN_HEIGHT * PIXEL_RATIO;
	canvas.style.cursor = 'crosshair';
	canvas.style.width = SCREEN_WIDTH + 'px';
	canvas.style.height = SCREEN_HEIGHT + 'px';
	container.appendChild(canvas);

	context = canvas.getContext("2d");
	context.save();
	context.scale(PIXEL_RATIO, PIXEL_RATIO);

	flattenCanvas = document.createElement("canvas");
	flattenCanvas.width = SCREEN_WIDTH * PIXEL_RATIO;
	flattenCanvas.height = SCREEN_HEIGHT * PIXEL_RATIO;

	palette = new Palette();

	foregroundColorSelector = new ColorSelector(palette);
	foregroundColorSelector.addEventListener('change', onForegroundColorSelectorChange, false);
	container.appendChild(foregroundColorSelector.container);

	backgroundColorSelector = new ColorSelector(palette);
	backgroundColorSelector.addEventListener('change', onBackgroundColorSelectorChange, false);
	container.appendChild(backgroundColorSelector.container);

	menu = new Menu();
	menu.foregroundColor.addEventListener('click', onMenuForegroundColor, false);
	menu.foregroundColor.addEventListener('touchend', onMenuForegroundColor, { passive: false });
	menu.background.addEventListener('click', onMenuBackgroundColor, false);
	menu.background.addEventListener('touchend', onMenuBackgroundColor, false);
	menu.selector.addEventListener('change', onMenuSelectorChange, false);
	menu.sizeSlider.addEventListener('input', onMenuSizeChange, false);
	menu.zoomPill.addEventListener('click', onMenuZoomReset, false);
	menu.save.addEventListener('click', onMenuSave, false);
	menu.save.addEventListener('touchend', onMenuSave, false);
	menu.clear.addEventListener('click', onMenuClear, false);
	menu.clear.addEventListener('touchend', onMenuClear, false);
	menu.about.addEventListener('click', onMenuAbout, false);
	menu.about.addEventListener('touchend', onMenuAbout, false);
	menu.download.addEventListener('click', onMenuDownload, false);
	menu.download.addEventListener('touchend', onMenuDownload, false);
	menu.upload.addEventListener('click', onMenuUpload, false);
	menu.upload.addEventListener('touchend', onMenuUpload, false);
	menu.fileInput.addEventListener('change', onUploadFileChange, false);
	menu.container.addEventListener('mouseover', onMenuMouseOver, { passive: false });
	menu.container.addEventListener('mouseout', onMenuMouseOut, { passive: false });
	menu.overflowPanel.addEventListener('mouseover', onMenuMouseOver, { passive: false });
	menu.overflowPanel.addEventListener('mouseout', onMenuMouseOut, { passive: false });
	container.appendChild(menu.container);

	if (STORAGE)
	{
		if (localStorage['harmony-canvas'])
		{
			localStorageImage = new Image();

			localStorageImage.addEventListener("load", function(event)
			{
				localStorageImage.removeEventListener(event.type, arguments.callee, false);
				context.restore();
				context.drawImage(localStorageImage,0,0);
				context.scale(PIXEL_RATIO, PIXEL_RATIO);
				isCanvasDirty = true;
			}, false);

			localStorageImage.src = localStorage['harmony-canvas'];
		}

		if (localStorage['harmony-bg'])
		{
			let array = JSON.parse(localStorage['harmony-color']);

			COLOR[0] = array[0];
			COLOR[1] = array[1];
			COLOR[2] = array[2];
		}

		if (localStorage['harmony-bg'])
		{
			let array = JSON.parse(localStorage['harmony-bg']);

			BACKGROUND_COLOR[0] = array[0];
			BACKGROUND_COLOR[1] = array[1];
			BACKGROUND_COLOR[2] = array[2];
		}
	}

	foregroundColorSelector.setColor( COLOR );
	backgroundColorSelector.setColor( BACKGROUND_COLOR );

	if (window.location.hash)
	{
		hash = window.location.hash.substr(1,window.location.hash.length);

		for (i = 0; i < BRUSHES.length; i++)
		{
			if (hash == BRUSHES[i])
			{
				brush = eval("new " + BRUSHES[i] + "(context)");
				menu.selector.selectedIndex = i;
				break;
			}
		}
	}

	if (!brush)
	{
		brush = eval("new " + BRUSHES[0] + "(context)");
	}

	about = new About();
	container.appendChild(about.container);

	window.addEventListener('mousemove', onWindowMouseMove, false);
	window.addEventListener('resize', onWindowResize, false);
	window.addEventListener('keydown', onWindowKeyDown, false);
	window.addEventListener('keyup', onWindowKeyUp, false);
	window.addEventListener('blur', onWindowBlur, false);

	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('mouseout', onDocumentMouseOut, false);

	document.addEventListener("dragenter", onDocumentDragEnter, false);
	document.addEventListener("dragover", onDocumentDragOver, false);
	document.addEventListener("drop", onDocumentDrop, false);

	canvas.addEventListener('mousedown', onCanvasMouseDown, { passive: false });
	canvas.addEventListener('touchstart', onCanvasTouchStart, { passive: false });
	canvas.addEventListener('wheel', onCanvasWheel, { passive: false });

	onWindowResize(null);
}


// WINDOW

function onWindowMouseMove( event )
{
	mouseX = event.clientX;
	mouseY = event.clientY;
}

function onWindowResize()
{
	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;

	if (!menu.moved)
		menu.container.style.left = ((SCREEN_WIDTH - menu.container.offsetWidth) / 2) + 'px';

	about.container.style.left = ((SCREEN_WIDTH - about.container.offsetWidth) / 2) + 'px';
	about.container.style.top = ((SCREEN_HEIGHT - about.container.offsetHeight) / 2) + 'px';

	clampPan();
	applyZoomTransform();
}

function onWindowKeyDown( event )
{
	if (isModalOpen)
		return;

	if (shiftKeyIsDown)
		return;

	switch(event.keyCode)
	{
		case 16: // Shift
			shiftKeyIsDown = true;
			foregroundColorSelector.container.style.left = mouseX - 125 + 'px';
			foregroundColorSelector.container.style.top = mouseY - 125 + 'px';
			foregroundColorSelector.container.style.visibility = 'visible';
			break;

		case 18: // Alt
			altKeyIsDown = true;
			break;

		case 68: // d
			if(BRUSH_SIZE > 1) BRUSH_SIZE --;
			menu.setBrushSize( BRUSH_SIZE );
			break;

		case 70: // f
			BRUSH_SIZE ++;
			menu.setBrushSize( BRUSH_SIZE );
			break;
	}
}

function onWindowKeyUp( event )
{
	if (isModalOpen)
		return;

	switch(event.keyCode)
	{
		case 16: // Shift
			shiftKeyIsDown = false;
			foregroundColorSelector.container.style.visibility = 'hidden';
			break;

		case 18: // Alt
			altKeyIsDown = false;
			break;

		case 82: // r
			brush.destroy();
			brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");
			break;
		case 66: // b
			document.body.style.backgroundImage = null;
			break;
	}

	context.lineCap = BRUSH_SIZE == 1 ? 'butt' : 'round';
}

function onWindowBlur( event )
{
	shiftKeyIsDown = false;
	altKeyIsDown = false;
}


// DOCUMENT

function onDocumentMouseDown( event )
{
	if (!isMenuMouseOver)
		event.preventDefault();
}

function onDocumentMouseOut( event )
{
	onCanvasMouseUp();
}

function onDocumentDragEnter( event )
{
	event.stopPropagation();
	event.preventDefault();
}

function onDocumentDragOver( event )
{
	event.stopPropagation();
	event.preventDefault();
}

function onDocumentDrop( event )
{
	event.stopPropagation();
	event.preventDefault();

	var file = event.dataTransfer.files[0];

	if (file.type.match(/image.*/))
	{
		/*
		 * TODO: This seems to work on Chromium. But not on Firefox.
		 * Better wait for proper FileAPI?
		 */

		var fileString = event.dataTransfer.getData('text').split("\n");
		document.body.style.backgroundImage = 'url(' + fileString[0] + ')';
	}
}


// COLOR SELECTORS

function onForegroundColorSelectorChange( event )
{
	COLOR = foregroundColorSelector.getColor();

	menu.setForegroundColor( COLOR );

	if (STORAGE)
	{
		localStorage['harmony-color'] = JSON.stringify(COLOR);
	}
}

function onBackgroundColorSelectorChange( event )
{
	BACKGROUND_COLOR = backgroundColorSelector.getColor();

	menu.setBackgroundColor( BACKGROUND_COLOR );

	document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';

	if (STORAGE)
	{
		localStorage['harmony-bg'] = JSON.stringify(BACKGROUND_COLOR);
	}
}


// MENU

function onMenuForegroundColor()
{
	cleanPopUps();

	foregroundColorSelector.show();
	foregroundColorSelector.container.style.left = ((SCREEN_WIDTH - foregroundColorSelector.container.offsetWidth) / 2) + 'px';
	foregroundColorSelector.container.style.top = ((SCREEN_HEIGHT - foregroundColorSelector.container.offsetHeight) / 2) + 'px';

	isFgColorSelectorVisible = true;
}

function onMenuBackgroundColor()
{
	cleanPopUps();

	backgroundColorSelector.show();
	backgroundColorSelector.container.style.left = ((SCREEN_WIDTH - backgroundColorSelector.container.offsetWidth) / 2) + 'px';
	backgroundColorSelector.container.style.top = ((SCREEN_HEIGHT - backgroundColorSelector.container.offsetHeight) / 2) + 'px';

	isBgColorSelectorVisible = true;
}

function onMenuSizeChange()
{
	BRUSH_SIZE = parseInt(menu.sizeSlider.value);
	menu.setBrushSize( BRUSH_SIZE );
	context.lineCap = BRUSH_SIZE == 1 ? 'butt' : 'round';
}

function onMenuSelectorChange()
{
	if (BRUSHES[menu.selector.selectedIndex] == "")
		return;

	brush.destroy();
	brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");

	window.location.hash = BRUSHES[menu.selector.selectedIndex];
}

function onMenuMouseOver()
{
	isMenuMouseOver = true;
}

function onMenuMouseOut()
{
	isMenuMouseOver = false;
}

function onMenuSave()
{
	// window.open(canvas.toDataURL('image/png'),'mywindow');
	flatten();
	flattenCanvas.toBlob(function(blob)
	{
		var url = URL.createObjectURL(blob);
		var link = document.createElement('a');
		link.download = 'harmony.png';
		link.href = url;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}, 'image/png');
}

function onMenuClear()
{
	openModal({
		danger: true,
		icon: ICON.trash,
		title: 'Clear canvas?',
		message: "This will erase your current drawing. This can't be undone.",
		confirmLabel: 'Clear',
		cancelLabel: 'Cancel',
		onConfirm: function()
		{
			context.clearRect(0, 0, SCREEN_WIDTH * PIXEL_RATIO, SCREEN_HEIGHT * PIXEL_RATIO);

			isCanvasDirty = false;

			if (STORAGE) saveToLocalStorage();

			brush.destroy();
			brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");
		}
	});
}

// A .harmony file is a zip holding:
//   image.png     - the raw canvas drawing
//   map.json      - the current brush's point map { points, count }
//   manifest.json - { date, selected_brush, canvas: { width, height, pixelRatio } }

function onMenuDownload()
{
	canvas.toBlob(function( blob )
	{
		blob.arrayBuffer().then(function( pngBuffer )
		{
			var brushName = BRUSHES[menu.selector.selectedIndex];

			var manifest = {
				app: 'harmony',
				version: 1,
				date: new Date().toISOString(),
				selected_brush: brushName,
				canvas: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, pixelRatio: PIXEL_RATIO }
			};

			var map = {
				points: brush.points || [],
				count: (typeof brush.count === 'number') ? brush.count : (brush.points ? brush.points.length : 0)
			};

			var files = {
				'image.png': new Uint8Array(pngBuffer),
				'map.json': fflate.strToU8(JSON.stringify(map)),
				'manifest.json': fflate.strToU8(JSON.stringify(manifest, null, 2))
			};

			var zipped = fflate.zipSync(files);
			var url = URL.createObjectURL(new Blob([zipped], { type: 'application/zip' }));
			var link = document.createElement('a');
			link.download = 'drawing.harmony';
			link.href = url;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		});
	}, 'image/png');
}

function onMenuUpload()
{
	menu.fileInput.value = '';
	menu.fileInput.click();
}

function onUploadFileChange()
{
	var file = menu.fileInput.files[0];

	if (!file)
		return;

	var MAX_FILE_BYTES = 64 * 1024 * 1024;   // reject implausibly large .harmony files up-front
	var MAX_MAP_BYTES = 16 * 1024 * 1024;    // guard JSON.parse of the point map
	var MAX_DIM = 8192, MAX_PIXELS = 40000000;

	if (file.size > MAX_FILE_BYTES)
	{
		openModal({ title: 'File too large', message: 'This .harmony file is too large to open.', confirmLabel: 'OK' });
		return;
	}

	file.arrayBuffer().then(function( buffer )
	{
		var files;

		try {
			files = fflate.unzipSync(new Uint8Array(buffer));
		} catch (e) {
			throw new Error('This is not a valid .harmony file.');
		}

		if (!files['image.png'] || !files['manifest.json'])
			throw new Error('This .harmony file is missing required contents.');

		if (files['map.json'] && files['map.json'].byteLength > MAX_MAP_BYTES)
			throw new Error('The point map in this file is too large.');

		var manifest = JSON.parse(fflate.strFromU8(files['manifest.json']));
		var rawMap = files['map.json'] ? JSON.parse(fflate.strFromU8(files['map.json'])) : { points: [], count: 0 };
		var pngBytes = files['image.png'];

		// Safety: read the PNG dimensions from the IHDR header before decoding,
		// so a decompression bomb is rejected without ever being decoded.
		var dims = pngDimensions(pngBytes);

		if (dims.width > MAX_DIM || dims.height > MAX_DIM || dims.width * dims.height > MAX_PIXELS)
			throw new Error('The image in this file is too large to open.');

		// The point map must be coordinated in size with the image.
		var savedCanvas = manifest.canvas || {};
		var expectedWidth = Math.round((savedCanvas.width || 0) * (savedCanvas.pixelRatio || 1));
		var expectedHeight = Math.round((savedCanvas.height || 0) * (savedCanvas.pixelRatio || 1));

		if (expectedWidth !== dims.width || expectedHeight !== dims.height)
			throw new Error("This file is inconsistent - the image and point map sizes don't match.");

		// Validate the points themselves against the saved canvas coordinate space.
		var map = validatePointMap(rawMap, savedCanvas.width, savedCanvas.height);

		var apply = function() { applyHarmony(manifest, map, pngBytes); };

		if (isCanvasDirty)
		{
			openModal({
				danger: true,
				icon: ICON.warning,
				title: 'Overwrite drawing?',
				message: "Opening this file will replace your current drawing. This can't be undone.",
				confirmLabel: 'Open',
				cancelLabel: 'Cancel',
				onConfirm: apply
			});
		}
		else
		{
			apply();
		}
	}).catch(function( error )
	{
		openModal({
			title: 'Could not open file',
			message: (error && error.message) || 'The file could not be opened.',
			confirmLabel: 'OK'
		});
	});
}

function validatePointMap( map, width, height )
{
	var MAX_POINTS = 100000;   // caps the brushes' O(n^2) neighbour loop

	if (!map || typeof map !== 'object')
		throw new Error('The point map is malformed.');

	var points = map.points;

	if (points === undefined || points === null)
		return { points: [], count: 0 };

	if (!Array.isArray(points))
		throw new Error('The point map is malformed.');

	if (points.length > MAX_POINTS)
		throw new Error('The point map is too large (' + points.length + ' points).');

	// Points live in the saved canvas coordinate space. Allow a full-canvas
	// margin on each side so strokes that ran past the edge still pass, while
	// still rejecting coordinates that clearly don't belong to this image.
	var minX = -width, maxX = width * 2, minY = -height, maxY = height * 2;

	for (var i = 0; i < points.length; i++)
	{
		var p = points[i];

		if (!Array.isArray(p) || p.length < 2 ||
		    typeof p[0] !== 'number' || typeof p[1] !== 'number' ||
		    !isFinite(p[0]) || !isFinite(p[1]) ||
		    p[0] < minX || p[0] > maxX || p[1] < minY || p[1] > maxY)
			throw new Error('The point map contains coordinates that do not match the image.');
	}

	var count = (typeof map.count === 'number' && isFinite(map.count)) ? map.count : points.length;
	if (count < 0 || count > points.length) count = points.length;

	return { points: points, count: count };
}

function pngDimensions( bytes )
{
	var signature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

	for (var i = 0; i < 8; i++)
		if (bytes[i] !== signature[i])
			throw new Error('The file does not contain a valid PNG image.');

	var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

	// Width and height live in the IHDR chunk at byte offsets 16 and 20.
	return { width: view.getUint32(16), height: view.getUint32(20) };
}

function applyHarmony( manifest, map, pngBytes )
{
	// Select the brush that was active when the file was saved.
	var index = BRUSHES.indexOf(manifest.selected_brush);
	if (index === -1) index = menu.selector.selectedIndex;

	menu.selector.selectedIndex = index;

	brush.destroy();
	brush = eval("new " + BRUSHES[index] + "(context)");

	// Inject the saved point map so the brush keeps connecting to it.
	if (map && map.points) brush.points = map.points;
	if (map && typeof map.count === 'number') brush.count = map.count;

	window.location.hash = BRUSHES[index];

	// Draw the image at 1:1 device pixels (matching how the canvas was saved).
	var url = URL.createObjectURL(new Blob([pngBytes], { type: 'image/png' }));
	var image = new Image();

	image.addEventListener('load', function()
	{
		URL.revokeObjectURL(url);

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(image, 0, 0);
		context.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);

		isCanvasDirty = true;

		if (STORAGE) saveToLocalStorage();
	}, false);

	image.addEventListener('error', function()
	{
		URL.revokeObjectURL(url);
		openModal({ title: 'Could not open image', message: 'The image could not be loaded.', confirmLabel: 'OK' });
	}, false);

	image.src = url;
}

function openModal( options )
{
	var backdrop = document.createElement('div');
	backdrop.className = 'modal-backdrop';

	var card = document.createElement('div');
	card.className = 'modal-card' + (options.danger ? ' danger' : '');

	var markup = '';
	if (options.icon) markup += '<span class="modal-icon">' + options.icon + '</span>';
	markup += '<h2>' + options.title + '</h2>';
	markup += '<p>' + options.message + '</p>';
	card.innerHTML = markup;

	var actions = document.createElement('div');
	actions.className = 'modal-actions';

	function close()
	{
		isModalOpen = false;
		document.removeEventListener('keydown', onKey, true);
		if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
	}

	function confirm()
	{
		close();
		if (options.onConfirm) options.onConfirm();
	}

	if (options.cancelLabel)
	{
		var cancelButton = document.createElement('button');
		cancelButton.type = 'button';
		cancelButton.className = 'modal-btn';
		cancelButton.textContent = options.cancelLabel;
		cancelButton.addEventListener('click', close, false);
		actions.appendChild(cancelButton);
	}

	var confirmButton = document.createElement('button');
	confirmButton.type = 'button';
	confirmButton.className = 'modal-btn primary';
	confirmButton.textContent = options.confirmLabel || 'OK';
	confirmButton.addEventListener('click', confirm, false);
	actions.appendChild(confirmButton);

	card.appendChild(actions);
	backdrop.appendChild(card);

	backdrop.addEventListener('pointerdown', function( event )
	{
		if (event.target === backdrop) close();
	}, false);

	// Keep focus inside the dialog and default it to the safe choice (Cancel),
	// so a stray Enter can never trigger the destructive action - the user has
	// to deliberately move to the confirm button (or click it).
	var focusable = options.cancelLabel ? [cancelButton, confirmButton] : [confirmButton];

	function onKey( event )
	{
		if (event.keyCode === 27)            // Escape cancels
		{
			event.stopPropagation();
			event.preventDefault();
			close();
		}
		else if (event.keyCode === 9)        // Tab cycles between the buttons only
		{
			event.preventDefault();
			var current = focusable.indexOf(document.activeElement);
			var step = event.shiftKey ? -1 : 1;
			focusable[(current + step + focusable.length) % focusable.length].focus();
		}
		// Enter / Space activate whichever button has focus (Cancel by default).
	}
	document.addEventListener('keydown', onKey, true);

	isModalOpen = true;
	document.body.appendChild(backdrop);
	focusable[0].focus();
}

function onMenuAbout()
{
	cleanPopUps();

	isAboutVisible = true;
	about.show();
}


// ZOOM

function screenToCanvas( x, y )
{
	return { x: (x - panX) / zoomLevel, y: (y - panY) / zoomLevel };
}

function applyZoomTransform()
{
	canvas.style.transformOrigin = '0 0';
	canvas.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoomLevel + ')';

	if (menu) menu.setZoomLevel( zoomLevel );
}

function clampPan()
{
	panX = Math.min(0, Math.max(SCREEN_WIDTH - SCREEN_WIDTH * zoomLevel, panX));
	panY = Math.min(0, Math.max(SCREEN_HEIGHT - SCREEN_HEIGHT * zoomLevel, panY));
}

function zoomAtPoint( newZoom, centerX, centerY )
{
	newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, newZoom));

	if (newZoom === zoomLevel)
		return;

	panX = centerX - (centerX - panX) * (newZoom / zoomLevel);
	panY = centerY - (centerY - panY) * (newZoom / zoomLevel);
	zoomLevel = newZoom;

	clampPan();
	applyZoomTransform();
}

function onMenuZoomReset()
{
	zoomLevel = 1;
	panX = 0;
	panY = 0;
	applyZoomTransform();
}

function onCanvasWheel( event )
{
	if (!event.ctrlKey)
		return;

	event.preventDefault();

	zoomAtPoint( zoomLevel * Math.pow(1.0015, -event.deltaY), event.clientX, event.clientY );
}


// CANVAS

function onCanvasMouseDown( event )
{
	var data, position, pos;

	clearTimeout(saveTimeOut);
	cleanPopUps();

	pos = screenToCanvas( event.clientX, event.clientY );

	if (altKeyIsDown)
	{
		flatten();

		data = flattenCanvas.getContext("2d").getImageData(0, 0, flattenCanvas.width, flattenCanvas.height).data;
		position = (Math.round(pos.x * PIXEL_RATIO) + Math.round(pos.y * PIXEL_RATIO) * flattenCanvas.width) * 4;

		foregroundColorSelector.setColor( [ data[position], data[position + 1], data[position + 2] ] );

		return;
	}

	BRUSH_PRESSURE = wacom && wacom.isWacom ? wacom.pressure : 1;

	isCanvasDirty = true;

	brush.strokeStart( pos.x, pos.y );

	window.addEventListener('mousemove', onCanvasMouseMove, { passive: false });
	window.addEventListener('mouseup', onCanvasMouseUp, { passive: false });
}

function onCanvasMouseMove( event )
{
	var pos = screenToCanvas( event.clientX, event.clientY );

	BRUSH_PRESSURE = wacom && wacom.isWacom ? wacom.pressure : 1;

	brush.stroke( pos.x, pos.y );
}

function onCanvasMouseUp()
{
	brush.strokeEnd();

	window.removeEventListener('mousemove', onCanvasMouseMove, { passive: false });
	window.removeEventListener('mouseup', onCanvasMouseUp, { passive: false });

	if (STORAGE)
	{
		clearTimeout(saveTimeOut);
		saveTimeOut = setTimeout(saveToLocalStorage, 2000, true);
	}
}


//

function touchDistance( touches )
{
	var dx = touches[0].pageX - touches[1].pageX;
	var dy = touches[0].pageY - touches[1].pageY;
	return Math.sqrt( dx * dx + dy * dy );
}

function onCanvasTouchStart( event )
{
	cleanPopUps();

	if(event.touches.length == 2)
	{
		event.preventDefault();

		pinching = true;
		pinchStartDist = touchDistance( event.touches );
		pinchStartZoom = zoomLevel;

		window.addEventListener('touchmove', onCanvasTouchMove, { passive: false });
		window.addEventListener('touchend', onCanvasTouchEnd, { passive: false });

		return;
	}

	if(event.touches.length == 1)
	{
		event.preventDefault();

		isCanvasDirty = true;

		var pos = screenToCanvas( event.touches[0].pageX, event.touches[0].pageY );
		brush.strokeStart( pos.x, pos.y );

		window.addEventListener('touchmove', onCanvasTouchMove, { passive: false });
		window.addEventListener('touchend', onCanvasTouchEnd, { passive: false });
	}
}

function onCanvasTouchMove( event )
{
	if(pinching)
	{
		if(event.touches.length == 2 && pinchStartDist > 0)
		{
			event.preventDefault();

			var dist = touchDistance( event.touches );
			var centerX = (event.touches[0].pageX + event.touches[1].pageX) / 2;
			var centerY = (event.touches[0].pageY + event.touches[1].pageY) / 2;

			zoomAtPoint( pinchStartZoom * (dist / pinchStartDist), centerX, centerY );
		}

		return;
	}

	if(event.touches.length == 1)
	{
		event.preventDefault();
		var pos = screenToCanvas( event.touches[0].pageX, event.touches[0].pageY );
		brush.stroke( pos.x, pos.y );
	}
}

function onCanvasTouchEnd( event )
{
	if(event.touches.length == 0)
	{
		event.preventDefault();

		if (!pinching)
			brush.strokeEnd();

		pinching = false;

		window.removeEventListener('touchmove', onCanvasTouchMove, { passive: false });
		window.removeEventListener('touchend', onCanvasTouchEnd, { passive: false });
	}
}

//

function saveToLocalStorage()
{
	localStorage['harmony-canvas'] = canvas.toDataURL('image/png');
}

function flatten()
{
	var context = flattenCanvas.getContext("2d");

	context.fillStyle = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.drawImage(canvas, 0, 0);
}

function cleanPopUps()
{
	if (isFgColorSelectorVisible)
	{
		foregroundColorSelector.hide();
		isFgColorSelectorVisible = false;
	}

	if (isBgColorSelectorVisible)
	{
		backgroundColorSelector.hide();
		isBgColorSelectorVisible = false;
	}

	if (isAboutVisible)
	{
		about.hide();
		isAboutVisible = false;
	}
}


// THEME

function themeGet()
{
	try { return localStorage['harmony-theme'] || 'auto'; }
	catch (e) { return 'auto'; }
}

function themeSet( value )
{
	try { localStorage['harmony-theme'] = value; } catch (e) {}
	themeApply( value );
}

function themeApply( value )
{
	var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	var dark = value === 'dark' || (value === 'auto' && prefersDark);

	document.documentElement.classList.toggle('theme-dark', dark);
}

if (window.matchMedia)
{
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function()
	{
		if (themeGet() === 'auto') themeApply('auto');
	});
}

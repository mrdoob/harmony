var i, brush, BRUSHES = ["sketchy", "shaded", "chrome", "fur", "longfur", "web", "", "simple", "squares", "ribbon", "", "circles", "grid"],
COLOR = [0, 0, 0], BACKGROUND_COLOR = [250, 250, 250],
SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,
container, foregroundColorSelector, backgroundColorSelector, menu, about,
canvas, flattenCanvas, context,
isForegroundColorSelectorVisible = false, isBackgroundColorSelectorVisible = false, isAboutVisible = false,
isMenuMouseOver = false, shiftKeyIsDown = false, altKeyIsDown = false;

init();

function init()
{
	var hash, palette;
	
	document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';

	container = document.createElement('div');
	document.body.appendChild(container);
	
	canvas = document.createElement("canvas");
	canvas.width = SCREEN_WIDTH;
	canvas.height = SCREEN_HEIGHT;
	canvas.style.cursor = 'crosshair';
	container.appendChild(canvas);
	
	flattenCanvas = document.createElement("canvas");
	flattenCanvas.width = SCREEN_WIDTH;
	flattenCanvas.height = SCREEN_HEIGHT;
	
	palette = new Palette();
	
	foregroundColorSelector = new ColorSelector(palette);
	foregroundColorSelector.container.addEventListener('mousedown', onForegroundColorSelectorMouseDown, false);
	foregroundColorSelector.container.addEventListener('touchstart', onForegroundColorSelectorTouchStart, false);
	container.appendChild(foregroundColorSelector.container);

	backgroundColorSelector = new ColorSelector(palette);
	backgroundColorSelector.container.addEventListener('mousedown', onBackgroundColorSelectorMouseDown, false);
	backgroundColorSelector.container.addEventListener('touchstart', onBackgroundColorSelectorTouchStart, false);
	container.appendChild(backgroundColorSelector.container);	
	
	menu = new Menu();
	menu.foregroundColor.addEventListener('click', onMenuForegroundColor, false);
	menu.foregroundColor.addEventListener('touchend', onMenuForegroundColor, false);
	menu.backgroundColor.addEventListener('click', onMenuBackgroundColor, false);
	menu.backgroundColor.addEventListener('touchend', onMenuBackgroundColor, false);
	menu.selector.onchange = onMenuSelectorChange;
	menu.save.addEventListener('click', onMenuSave, false);
	menu.save.addEventListener('touchend', onMenuSave, false);
	menu.clear.addEventListener('click', onMenuClear, false);
	menu.clear.addEventListener('touchend', onMenuClear, false);
	menu.about.addEventListener('click', onMenuAbout, false);
	menu.about.addEventListener('touchend', onMenuAbout, false);
	menu.container.onmouseover = onMenuMouseOver;
	menu.container.onmouseout = onMenuMouseOut;
	container.appendChild(menu.container);

	context = canvas.getContext("2d");
	
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
	window.addEventListener('keydown', onDocumentKeyDown, false);
	window.addEventListener('keyup', onDocumentKeyUp, false);
	
	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('mouseout', onCanvasMouseUp, false);
	
	canvas.addEventListener('mousedown', onCanvasMouseDown, false);
	canvas.addEventListener('touchstart', onCanvasTouchStart, false);
	
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
	
	menu.container.style.left = ((SCREEN_WIDTH - menu.container.offsetWidth) / 2) + 'px';
	
	about.container.style.left = ((SCREEN_WIDTH - about.container.offsetWidth) / 2) + 'px';
	about.container.style.top = ((SCREEN_HEIGHT - about.container.offsetHeight) / 2) + 'px';
}


// DOCUMENT

function onDocumentMouseDown( event )
{
	if (!isMenuMouseOver)
		event.preventDefault();
}

function onDocumentKeyDown( event )
{
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
		case 82: // r
			brush.destroy();
			brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");
			break;
	}
}

function onDocumentKeyUp( event )
{
	switch(event.keyCode)
	{
		case 16: // Shift
			shiftKeyIsDown = false;
			foregroundColorSelector.container.style.visibility = 'hidden';			
			break;
		case 18: // Alt
			altKeyIsDown = false;
			break;	
	}
}

// COLOR SELECTORS

function setForegroundColor( x, y )
{
	foregroundColorSelector.update( x, y );
	COLOR = foregroundColorSelector.getColor();
	menu.setForegroundColor( COLOR );	
}

function onForegroundColorSelectorMouseDown( event )
{
	window.addEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
	window.addEventListener('mouseup', onForegroundColorSelectorMouseUp, false);
	
	setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );	
}

function onForegroundColorSelectorMouseMove( event )
{
	setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );
}

function onForegroundColorSelectorMouseUp( event )
{
	window.removeEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
	window.removeEventListener('mouseup', onForegroundColorSelectorMouseUp, false);

	setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );
}

function onForegroundColorSelectorTouchStart( event )
{
	if(event.touches.length == 1)
	{
		event.preventDefault();
		
		setForegroundColor( event.touches[0].pageX - foregroundColorSelector.container.offsetLeft, event.touches[0].pageY - foregroundColorSelector.container.offsetTop );
		
		window.addEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
		window.addEventListener('touchend', onForegroundColorSelectorTouchEnd, false);
	}
}

function onForegroundColorSelectorTouchMove( event )
{
	if(event.touches.length == 1)
	{
		event.preventDefault();
		
		setForegroundColor( event.touches[0].pageX - foregroundColorSelector.container.offsetLeft, event.touches[0].pageY - foregroundColorSelector.container.offsetTop );
	}
}

function onForegroundColorSelectorTouchEnd( event )
{
	if(event.touches.length == 0)
	{
		event.preventDefault();
		
		window.removeEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
		window.removeEventListener('touchend', onForegroundColorSelectorTouchEnd, false);
	}	
}


//

function setBackgroundColor( x, y )
{
	backgroundColorSelector.update( x, y );
	BACKGROUND_COLOR = backgroundColorSelector.getColor();
	menu.setBackgroundColor( BACKGROUND_COLOR );
	
	document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';	
}

function onBackgroundColorSelectorMouseDown( event )
{
	window.addEventListener('mousemove', onBackgroundColorSelectorMouseMove, false);
	window.addEventListener('mouseup', onBackgroundColorSelectorMouseUp, false);
}

function onBackgroundColorSelectorMouseMove( event )
{
	setBackgroundColor( event.clientX - backgroundColorSelector.container.offsetLeft, event.clientY - backgroundColorSelector.container.offsetTop );
}

function onBackgroundColorSelectorMouseUp( event )
{
	window.removeEventListener('mousemove', onBackgroundColorSelectorMouseMove, false);
	window.removeEventListener('mouseup', onBackgroundColorSelectorMouseUp, false);
	
	setBackgroundColor( event.clientX - backgroundColorSelector.container.offsetLeft, event.clientY - backgroundColorSelector.container.offsetTop );
}


function onBackgroundColorSelectorTouchStart( event )
{
	if(event.touches.length == 1)
	{
		event.preventDefault();
		
		setBackgroundColor( event.touches[0].pageX - backgroundColorSelector.container.offsetLeft, event.touches[0].pageY - backgroundColorSelector.container.offsetTop );
		
		window.addEventListener('touchmove', onBackgroundColorSelectorTouchMove, false);
		window.addEventListener('touchend', onBackgroundColorSelectorTouchEnd, false);
	}
}

function onBackgroundColorSelectorTouchMove( event )
{
	if(event.touches.length == 1)
	{
		event.preventDefault();
		
		setBackgroundColor( event.touches[0].pageX - backgroundColorSelector.container.offsetLeft, event.touches[0].pageY - backgroundColorSelector.container.offsetTop );
	}
}

function onBackgroundColorSelectorTouchEnd( event )
{
	if(event.touches.length == 0)
	{
		event.preventDefault();
		
		window.removeEventListener('touchmove', onBackgroundColorSelectorTouchMove, false);
		window.removeEventListener('touchend', onBackgroundColorSelectorTouchEnd, false);
	}	
}


// MENU

function onMenuForegroundColor()
{
	cleanPopUps();
	
	foregroundColorSelector.show();
	foregroundColorSelector.container.style.left = ((SCREEN_WIDTH - foregroundColorSelector.container.offsetWidth) / 2) + 'px';
	foregroundColorSelector.container.style.top = ((SCREEN_HEIGHT - foregroundColorSelector.container.offsetHeight) / 2) + 'px';

	isForegroundColorSelectorVisible = true;
}

function onMenuBackgroundColor()
{
	cleanPopUps();

	backgroundColorSelector.show();
	backgroundColorSelector.container.style.left = ((SCREEN_WIDTH - backgroundColorSelector.container.offsetWidth) / 2) + 'px';
	backgroundColorSelector.container.style.top = ((SCREEN_HEIGHT - backgroundColorSelector.container.offsetHeight) / 2) + 'px';

	isBackgroundColorSelectorVisible = true;
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
	var context = flattenCanvas.getContext("2d");
	
	context.fillStyle = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.drawImage(canvas, 0, 0);

	window.open(flattenCanvas.toDataURL("image/png"),'mywindow');
}

function onMenuClear()
{
	context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	brush.destroy();
	brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");
}

function onMenuAbout()
{
	cleanPopUps();

	isAboutVisible = true;
	about.show();
}


// CANVAS

function onCanvasMouseDown( event )
{
	cleanPopUps();
	
	brush.strokeStart( event.clientX, event.clientY );

	window.addEventListener('mousemove', onCanvasMouseMove, false);
	window.addEventListener('mouseup', onCanvasMouseUp, false);
}

function onCanvasMouseMove( event )
{
	brush.stroke( event.clientX, event.clientY );
}

function onCanvasMouseUp()
{
	brush.strokeEnd();
	
	window.removeEventListener('mousemove', onCanvasMouseMove, false);	
	window.removeEventListener('mouseup', onCanvasMouseUp, false);
}


//

function onCanvasTouchStart( event )
{
	cleanPopUps();		

	if(event.touches.length == 1)
	{
		event.preventDefault();
		
		brush.strokeStart( event.touches[0].pageX, event.touches[0].pageY );
		
		window.addEventListener('touchmove', onCanvasTouchMove, false);
		window.addEventListener('touchend', onCanvasTouchEnd, false);
	}
}

function onCanvasTouchMove( event )
{
	if(event.touches.length == 1)
	{
		event.preventDefault();
		brush.stroke( event.touches[0].pageX, event.touches[0].pageY );
	}
}

function onCanvasTouchEnd( event )
{
	if(event.touches.length == 0)
	{
		event.preventDefault();
		
		brush.strokeEnd();

		window.removeEventListener('touchmove', onCanvasTouchMove, false);
		window.removeEventListener('touchend', onCanvasTouchEnd, false);
	}
}

//

function cleanPopUps()
{
	if (isForegroundColorSelectorVisible)
	{
		foregroundColorSelector.hide();
		isForegroundColorSelectorVisible = false;
	}
		
	if (isBackgroundColorSelectorVisible)
	{
		backgroundColorSelector.hide();
		isBackgroundColorSelectorVisible = false;
	}
	
	if (isAboutVisible)
	{
		about.hide();
		isAboutVisible = false;
	}
}

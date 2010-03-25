var i,
style,
STYLES = ["sketchy", "shaded", "chrome", "fur", "longfur", "web", "", "simple", "squares", "ribbon", "", "circles", "grid"],
COLOR = [0, 0, 0], BACKGROUND_COLOR = [250, 250, 250],
SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,
container, foregroundColorSelector, backgroundColorSelector, menu,  about,
canvas, flattenCanvas, context,
mouseX = 0, mouseY = 0,
isForegroundColorSelectorVisible = false, isBackgroundColorSelectorVisible = false, isAboutVisible = false;
isMenuMouseOver = false, controlKeyIsDown = false

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

		for (i = 0; i < STYLES.length; i++)
		{
			if (hash == STYLES[i])
			{
				style = eval("new " + STYLES[i] + "(context)");
				menu.selector.selectedIndex = i;
				break;
			}
		}
	}

	if (!style)
	{
		style = eval("new " + STYLES[0] + "(context)");
	}
	
	about = new About();
	container.appendChild(about.container);
	
	window.onmousemove = onWindowMouseMove;
	window.onresize = onWindowResize;
	window.onkeydown = onDocumentKeyDown;
	window.onkeyup = onDocumentKeyUp;
	
	document.onmousedown = onDocumentMouseDown;
	document.onmouseout = onCanvasMouseUp;
	
	canvas.addEventListener('mousedown', onCanvasMouseDown, false);
	canvas.addEventListener('touchstart', onCanvasTouchStart, false);
	
	onWindowResize(null);
}


// WINDOW

function onWindowMouseMove(e)
{
	mouseX = e.clientX;
	mouseY = e.clientY;
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

function onDocumentMouseDown()
{
	return isMenuMouseOver;
}

function onDocumentKeyDown(e)
{
	if (controlKeyIsDown)
		return;

	switch(e.keyCode)
	{
		case 16: // Shift
			controlKeyIsDown = true;
			foregroundColorSelector.container.style.left = mouseX - 125 + 'px';
			foregroundColorSelector.container.style.top = mouseY - 125 + 'px';
			foregroundColorSelector.container.style.visibility = 'visible';
			break;
	}
}

function onDocumentKeyUp(e)
{
	switch(e.keyCode)
	{
		case 16: // Shift
			controlKeyIsDown = false;
			foregroundColorSelector.container.style.visibility = 'hidden';			
			break;
	}
}

// COLOR SELECTORS

function onForegroundColorSelectorMouseDown()
{
	window.addEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
	window.addEventListener('mouseup', onForegroundColorSelectorMouseUp, false);
}

function onForegroundColorSelectorMouseUp()
{
	window.removeEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
	window.removeEventListener('mouseup', onForegroundColorSelectorMouseUp, false);

	foregroundColorSelector.update();
	COLOR = foregroundColorSelector.getColor();
	menu.setForegroundColor( COLOR );
}

function onForegroundColorSelectorMouseMove()
{
	foregroundColorSelector.update();
	COLOR = foregroundColorSelector.getColor();
	menu.setForegroundColor( COLOR );
}

//

function onForegroundColorSelectorTouchStart(e)
{
	if(e.touches.length == 1)
	{
		var touch = e.touches[0];
		
		window.addEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
		window.addEventListener('touchend', onForegroundColorSelectorTouchEnd, false);
		
		return false;
	}
}

function onForegroundColorSelectorTouchMove(e)
{
	if(e.touches.length == 1)
	{
		var touch = e.touches[0];
		style.strokeEnd( touch.pageX, touch.pageY );

	
	}
}

function onForegroundColorSelectorTouchEnd(e)
{
	if(e.touches.length == 1)
	{
		window.removeEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
		window.removeEventListener('touchend', onForegroundColorSelectorTouchEnd, false);	
	}	
}


//

function onBackgroundColorSelectorMouseDown()
{
	window.addEventListener('mousemove', onBackgroundColorSelectorMouseMove, false);
	window.addEventListener('mouseup', onBackgroundColorSelectorMouseUp, false);
}

function onBackgroundColorSelectorMouseUp()
{
	window.removeEventListener('mousemove', onBackgroundColorSelectorMouseMove, false);
	window.removeEventListener('mouseup', onBackgroundColorSelectorMouseUp, false);
	
	backgroundColorSelector.update();
	BACKGROUND_COLOR = backgroundColorSelector.getColor();
	menu.setBackgroundColor( BACKGROUND_COLOR );
	
	document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';	
}

function onBackgroundColorSelectorMouseMove()
{
	backgroundColorSelector.update();
	BACKGROUND_COLOR = backgroundColorSelector.getColor();
	menu.setBackgroundColor( BACKGROUND_COLOR );
	
	document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';
}

//

function onBackgroundColorSelectorTouchStart()
{
	
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
	if (STYLES[menu.selector.selectedIndex] == "")
		return;

	style.destroy();
	style = eval("new " + STYLES[menu.selector.selectedIndex] + "(context)");

	window.location.hash = STYLES[menu.selector.selectedIndex];
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

	style = eval("new " + STYLES[menu.selector.selectedIndex] + "(context)");
}

function onMenuAbout()
{
	cleanPopUps();

	isAboutVisible = true;
	about.show();
}


// CANVAS

function onCanvasMouseDown()
{
	cleanPopUps();

	style.strokeStart( mouseX, mouseY );

	window.addEventListener('mousemove', onCanvasMouseMove, false);
	window.addEventListener('mouseup', onCanvasMouseUp, false);
}

function onCanvasMouseUp()
{
	style.strokeEnd( mouseX, mouseY );
	
	window.removeEventListener('mousemove', onCanvasMouseMove, false);	
	window.removeEventListener('mouseup', onCanvasMouseUp, false);
}

function onCanvasMouseMove()
{
	style.stroke( mouseX, mouseY );
}

//

function onCanvasTouchStart(e)
{
	if(e.touches.length == 1)
	{
		var touch = e.touches[0];
		style.strokeStart( touch.pageX, touch.pageY );
		
		window.addEventListener('touchmove', onCanvasTouchMove, false);
		window.addEventListener('touchend', onCanvasTouchEnd, false);
		
		return false;
	}
}

function onCanvasTouchMove(e)
{
	if(e.touches.length == 1)
	{
		var touch = e.touches[0];
		style.stroke( touch.pageX, touch.pageY );
		return false;
	}
}

function onCanvasTouchEnd(e)
{
	if(e.touches.length == 1)
	{
		var touch = e.touches[0];
		style.strokeEnd( touch.pageX, touch.pageY );

		window.removeEventListener('touchmove', onCanvasTouchMove, false);
		window.removeEventListener('touchend', onCanvasTouchEnd, false);

		return false;
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
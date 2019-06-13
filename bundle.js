(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var copy = require('copy-to-clipboard')

document.addEventListener('keypress', function (event) {
  if (event.keyCode === 99) { // the c key
    var svg = document.querySelector('svg')
    var inner = svg.innerHTML
    var head = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" '
    + '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"> '
    + '<svg width="521px" height="521px" version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events">'
    var foot = '</svg>'

     var full = head + inner + foot;

     copy(full)
  }
})

var createViewer = require('../index')

var viewer = createViewer({
  width: 0.4,
  height: 0.4,
  followMouse: true,
  followMotion: true,
})

document.body.appendChild(viewer.container)

},{"../index":2,"copy-to-clipboard":3}],2:[function(require,module,exports){
var SVG_NS = 'http://www.w3.org/2000/svg';


function createNode (type) {
  return document.createElementNS(SVG_NS, type)
}


function setAttribute (node, attribute, value) {
  node.setAttributeNS(null, attribute, value)
}


function rotate(out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < 0.000001) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};


module.exports = function createLogo (options_) {

	var container = createNode('svg')

	setAttribute(container, 'width', 500 + 'px')
	setAttribute(container, 'height', 500 + 'px')

	document.body.appendChild(container)

	var NUM_HEX = 12;

	var hexes = []
    var rectangles = []

	var offset = -78

	var turnRate = 7

	var followCursor = true//!!options.followMouse
//	var followMotion = !!options.followMotion
	//var slowDrift = !!options.slowDrift
	var shouldRender = true


	var X = new Float32Array([1, 0, 0])
	var Y = new Float32Array([0, 1, 0])
	var Z = new Float32Array([0, 0, 1])

    function rad(a){
		return a*Math.PI*2/360;
	}

    function Polygon (svg) {
        this.svg = svg
    }

    polygons = []

    logo_colors = [
    'rgb(129,152,84)', 'rgb(77,175,76)',  'rgb(71,178,72)',  'rgb(71,178,72)',  'rgb(77,175,76)',  'rgb(77,174,76)', //all invisible except 1st
    'rgb(35,157,82)',  'rgb(35,157,82)',  'rgb(75,175,76)',  'rgb(77,175,76)',  'rgb(77,174,76)',  'rgb(77,174,76)', // all visible briefly 
    'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)', // all a bit more visible
    'rgb(77,174,76)',  'rgb(130,137,57)', 'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',  
    'rgb(129,152,83)', 'rgb(126,134,61)', 'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)', 
    'rgb(77,174,76)',  'rgb(129,137,64)', 'rgb(129,137,62)', 'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',         
    'rgb(77,174,76)',  'rgb(78,174,73)',  'rgb(129,136,69)', 'rgb(94,171,71)',  'rgb(94,175,77)',  'rgb(94,172,71)',
    'rgb(75,176,76)',  'rgb(74,175,78)',  'rgb(129,137,64)', 'rgb(129,137,64)', 'rgb(91,176,72)',  'rgb(91,176,72)',   // front
    'rgb(78,174,76)',  'rgb(78,174,76)',  'rgb(108,145,75)', 'rgb(129,137,64)', 'rgb(129,137,64)', 'rgb(91,176,72)',   // front also
    'rgb(41,177,113)', 'rgb(35,157,82)',  'rgb(106,146,75)', 'rgb(115,130,71)', 'rgb(129,137,64)', 'rgb(129,152,84)',  // front also also
    'rgb(43,174,116)', 'rgb(42,178,112)', 'rgb(69,176,68)',  'rgb(115,130,71)', 'rgb(129,137,62)', 'rgb(221,136,122)', // front here too
    'rgb(89,178,68)',  'rgb(41,177,120)', 'rgb(35,157,82)',  'rgb(106,146,75)', 'rgb(115,130,71)', 'rgb(129,137,64)',  // mostly "edge spiral"
	]



   	currentColor = 0
   	function yieldColor() {
   		currentColor = (currentColor + 1) % logo_colors.length
   		return logo_colors[currentColor]
   	}

    var mouse = {
      x: 0,
      y: 0
    }
    
	function createRect(x1, y1, x2, y2, x3, y3, x4, y4) {
		var rect = createNode('polygon')
		setAttribute(rect, 'points', x1 + "," + y1 + ' ' + x2 + ',' + y2 + " " + x3 + ',' + y3 + ' ' + x4 +',' + y4)
		setAttribute(rect, 'style', "fill:" + yieldColor() + ";stroke:black;stroke-width:.6")
		container.appendChild(rect)
		return rect
	}

	function updateRect(x1, y1, x2, y2, x3, y3, x4, y4, polygon) {
		setAttribute(polygon.svg, 'points', x1 + "," + y1 + ' ' + x2 + ',' + y2 + " " + x3 + ',' + y3 + ' ' + x4 +',' + y4)
	}

	function buildAnnulus(mrad,hrad) {
		hexes = []
        angles = []
	    // build the ring
		for(let hexitr = 0; hexitr < NUM_HEX; ++hexitr) {
			//find centroids of hexagons
			let cang = hexitr*360/NUM_HEX;
			let centroid = {
				x:Math.cos(rad(cang + offset))*mrad,
				y:Math.sin(rad(cang + offset))*mrad,
				z:-hrad/2 // shift back so that y plane intersects "shift" rotational axis.
			};
            angles.push(cang + offset)
            hex = []
	        for(let vertex = 0; vertex < 6; ++vertex) {
	            hex.push([
	            	centroid.x, 
	            	Math.sin(rad(vertex * 60)) * hrad + centroid.y,
	            	Math.cos(rad(vertex * 60)) * hrad + hrad/2
	            ])
	        }
	        hexes.push(hex)
	    }
	}

	function shiftMobius() {
		for (hexitr = 0; hexitr < hexes.length; ++hexitr) {
	        XTran = hexes[hexitr][2][0]
	        mat1 = new Float32Array([
	        	hexes[hexitr][0][0] - XTran, hexes[hexitr][1][0] - XTran, hexes[hexitr][2][0] - XTran, 1,
	        	hexes[hexitr][0][1],         hexes[hexitr][1][1],         hexes[hexitr][2][1],         1,
	        	hexes[hexitr][0][2],         hexes[hexitr][1][2],         hexes[hexitr][2][2],         1,
	        	1,                           1,                           1,                           1
	        ]);

	        mat2 = new Float32Array([
	        	hexes[hexitr][3][0] - XTran, hexes[hexitr][4][0] - XTran, hexes[hexitr][5][0] - XTran, 1,
	        	hexes[hexitr][3][1],         hexes[hexitr][4][1],         hexes[hexitr][5][1],         1,
	        	hexes[hexitr][3][2],         hexes[hexitr][4][2],         hexes[hexitr][5][2],         1,
	        	1,                           1,                           1,                           1
	        ]);

	     	rotate(mat1, mat1, rad(60), Y);
			rotate(mat2, mat2, rad(60), Y);

	 		hexes[hexitr][0][0] = mat1[0] + XTran; hexes[hexitr][1][0] = mat1[1] + XTran; hexes[hexitr][2][0] = mat1[2] + XTran;
	 		hexes[hexitr][0][1] = mat1[4];         hexes[hexitr][1][1] = mat1[5];         hexes[hexitr][2][1] = mat1[6];
	 		hexes[hexitr][0][2] = mat1[8];         hexes[hexitr][1][2] = mat1[9];         hexes[hexitr][2][2] = mat1[10];

	 		hexes[hexitr][3][0] = mat2[0] + XTran; hexes[hexitr][4][0] = mat2[1] + XTran; hexes[hexitr][5][0] = mat2[2] + XTran;
	 		hexes[hexitr][3][1] = mat2[4];         hexes[hexitr][4][1] = mat2[5];         hexes[hexitr][5][1] = mat2[6];
	 		hexes[hexitr][3][2] = mat2[8];         hexes[hexitr][4][2] = mat2[9];         hexes[hexitr][5][2] = mat2[10];

		}
	}




    function nextHex(currentHex){
    	if (currentHex < hexes.length - 1) {
    		return currentHex + 1;
    	}
    	else {
    	    return 0
    	}
    }

    function prevHex(currentHex) {
        if (currentHex > 0) {
            return currentHex - 1;
        }
        else {
            return hexes.length -1
        }
    }

    function nextVertex(currentVertex) {
    	if (currentVertex > 0) {
    		return currentVertex - 1
    	}
    	else { return 5 }
    }

    function prevVertex(currentVertex) {
        if (currentVertex < 5) {
            return currentVertex + 1
        }
        else {
            return 0
        }
    }

    polygons = []


	function buildPolygons() {
    for (let loops = 0; loops < 6; loops++) {
      hexitr = ((loops +17) * 9) % 11; // the magic
      for(hexesDrawn = 0; hexesDrawn < 12; hexesDrawn++) {
        polygons.push( 
          new Polygon(
				    createRect(
  		        hexes[hexitr][loops][0] + 200, hexes[hexitr][loops][1] + 200, 
  		        hexes[nextHex(hexitr)][loops][0] + 200, hexes[nextHex(hexitr)][loops][1] + 200,
  		        hexes[nextHex(hexitr)][nextVertex(loops)][0] + 200, hexes[nextHex(hexitr)][nextVertex(loops)][1] + 200,
  		        hexes[hexitr][nextVertex(loops)][0] + 200, hexes[hexitr][nextVertex(loops)][1] + 200
  		        )
            )
          );
		    hexitr = nextHex(hexitr);
			}
    }
	}



	function updatePolygons() {
    for (let loops = 0; loops < 6; loops++) {
        hexitr = ((loops+17) * 9) % 11;  // the magic
        for(hexesDrawn = 0; hexesDrawn < 12; hexesDrawn++) {
			 	    updateRect( // front view
		        	    hexes[hexitr][loops][0] + 200, hexes[hexitr][loops][1] + 200, 
		             	hexes[nextHex(hexitr)][loops][0] + 200, hexes[nextHex(hexitr)][loops][1] + 200,
		        	    hexes[nextHex(hexitr)][nextVertex(loops)][0] + 200, hexes[nextHex(hexitr)][nextVertex(loops)][1] + 200,
		        	    hexes[hexitr][nextVertex(loops)][0] + 200, hexes[hexitr][nextVertex(loops)][1] + 200,
		        	    polygons[((hexesDrawn * 6) + loops) % 72]
		            );			
            hexitr = nextHex(hexitr);
            }
	    }
	}


  function setTurnTo(target) {
    var bounds = container.getBoundingClientRect();
    mouse.x = 1.0 - 2.0 * (target.x - bounds.left) / bounds.width;
    mouse.y = 1.0 - 2.0 * (target.y - bounds.top) / bounds.height;
  }

	function stopAnimation() { shouldRender = false }
	function startAnimation() { shouldRender = true }
	function setFollowMouse (state) { followCursor = state }
	function setFollowMotion (state) { followMotion = state }	

  var loaded = false
	var previousMouseY = 0
	var previousMouseX = 0

	window.addEventListener('mousemove', function (ev) {
		if (!shouldRender) { startAnimation() }		
	  	if (followCursor) {
      		setTurnTo({
        		x: ev.clientX,
       			y: ev.clientY,
   			})
 	  		if (!loaded) {
	  			previousMouseX = mouse.x
	  			previousMouseY = mouse.y
	  			loaded = true
	  		}
	   		renderScene()
		}	
	})

	function renderScene () {
		if (!shouldRender) return
		window.requestAnimationFrame(renderScene)
		offset = 
			offset - 
				(Math.abs(
					(Math.sqrt(Math.abs(Math.abs(previousMouseY) - Math.abs(mouse.y)))) + 
					(Math.sqrt(Math.abs(Math.abs(previousMouseX) - Math.abs(mouse.x))))) * 
				turnRate);
		previousMouseY = mouse.y;
		previousMouseX = mouse.x;

   	buildAnnulus(100,50);
		shiftMobius();
		updatePolygons();
 		stopAnimation();
	}

    buildAnnulus(100,50);
    shiftMobius();
    buildPolygons();
  	renderScene();

  return {
    container: container,
    turnTo: setTurnTo,
    setFollowMouse: setFollowMouse,
    setFollowMotion: setFollowMotion,
    stopAnimation: stopAnimation,
    startAnimation: startAnimation,
  }
}
},{}],3:[function(require,module,exports){
"use strict";

var deselectCurrent = require("toggle-selection");

var defaultMessage = "Copy to clipboard: #{key}, Enter";

function format(message) {
  var copyKey = (/mac os x/i.test(navigator.userAgent) ? "⌘" : "Ctrl") + "+C";
  return message.replace(/#{\s*key\s*}/g, copyKey);
}

function copy(text, options) {
  var debug,
    message,
    reselectPrevious,
    range,
    selection,
    mark,
    success = false;
  if (!options) {
    options = {};
  }
  debug = options.debug || false;
  try {
    reselectPrevious = deselectCurrent();

    range = document.createRange();
    selection = document.getSelection();

    mark = document.createElement("span");
    mark.textContent = text;
    // reset user styles for span element
    mark.style.all = "unset";
    // prevents scrolling to the end of the page
    mark.style.position = "fixed";
    mark.style.top = 0;
    mark.style.clip = "rect(0, 0, 0, 0)";
    // used to preserve spaces and line breaks
    mark.style.whiteSpace = "pre";
    // do not inherit user-select (it may be `none`)
    mark.style.webkitUserSelect = "text";
    mark.style.MozUserSelect = "text";
    mark.style.msUserSelect = "text";
    mark.style.userSelect = "text";
    mark.addEventListener("copy", function(e) {
      e.stopPropagation();
      if (options.format) {
        e.preventDefault();
        e.clipboardData.clearData();
        e.clipboardData.setData(options.format, text);
      }
    });

    document.body.appendChild(mark);

    range.selectNodeContents(mark);
    selection.addRange(range);

    var successful = document.execCommand("copy");
    if (!successful) {
      throw new Error("copy command was unsuccessful");
    }
    success = true;
  } catch (err) {
    debug && console.error("unable to copy using execCommand: ", err);
    debug && console.warn("trying IE specific stuff");
    try {
      window.clipboardData.setData(options.format || "text", text);
      success = true;
    } catch (err) {
      debug && console.error("unable to copy using clipboardData: ", err);
      debug && console.error("falling back to prompt");
      message = format("message" in options ? options.message : defaultMessage);
      window.prompt(message, text);
    }
  } finally {
    if (selection) {
      if (typeof selection.removeRange == "function") {
        selection.removeRange(range);
      } else {
        selection.removeAllRanges();
      }
    }

    if (mark) {
      document.body.removeChild(mark);
    }
    reselectPrevious();
  }

  return success;
}

module.exports = copy;

},{"toggle-selection":4}],4:[function(require,module,exports){

module.exports = function () {
  var selection = document.getSelection();
  if (!selection.rangeCount) {
    return function () {};
  }
  var active = document.activeElement;

  var ranges = [];
  for (var i = 0; i < selection.rangeCount; i++) {
    ranges.push(selection.getRangeAt(i));
  }

  switch (active.tagName.toUpperCase()) { // .toUpperCase handles XHTML
    case 'INPUT':
    case 'TEXTAREA':
      active.blur();
      break;

    default:
      active = null;
      break;
  }

  selection.removeAllRanges();
  return function () {
    selection.type === 'Caret' &&
    selection.removeAllRanges();

    if (!selection.rangeCount) {
      ranges.forEach(function(range) {
        selection.addRange(range);
      });
    }

    active &&
    active.focus();
  };
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImV4YW1wbGUvZXhhbXBsZS5qcyIsImluZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvcHktdG8tY2xpcGJvYXJkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RvZ2dsZS1zZWxlY3Rpb24vaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIGNvcHkgPSByZXF1aXJlKCdjb3B5LXRvLWNsaXBib2FyZCcpXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGlmIChldmVudC5rZXlDb2RlID09PSA5OSkgeyAvLyB0aGUgYyBrZXlcbiAgICB2YXIgc3ZnID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc3ZnJylcbiAgICB2YXIgaW5uZXIgPSBzdmcuaW5uZXJIVE1MXG4gICAgdmFyIGhlYWQgPSAnPCFET0NUWVBFIHN2ZyBQVUJMSUMgXCItLy9XM0MvL0RURCBTVkcgMS4xLy9FTlwiICdcbiAgICArICdcImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZFwiPiAnXG4gICAgKyAnPHN2ZyB3aWR0aD1cIjUyMXB4XCIgaGVpZ2h0PVwiNTIxcHhcIiB2ZXJzaW9uPVwiMS4xXCIgYmFzZVByb2ZpbGU9XCJmdWxsXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHhtbG5zOmV2PVwiaHR0cDovL3d3dy53My5vcmcvMjAwMS94bWwtZXZlbnRzXCI+J1xuICAgIHZhciBmb290ID0gJzwvc3ZnPidcblxuICAgICB2YXIgZnVsbCA9IGhlYWQgKyBpbm5lciArIGZvb3Q7XG5cbiAgICAgY29weShmdWxsKVxuICB9XG59KVxuXG52YXIgY3JlYXRlVmlld2VyID0gcmVxdWlyZSgnLi4vaW5kZXgnKVxuXG52YXIgdmlld2VyID0gY3JlYXRlVmlld2VyKHtcbiAgd2lkdGg6IDAuNCxcbiAgaGVpZ2h0OiAwLjQsXG4gIGZvbGxvd01vdXNlOiB0cnVlLFxuICBmb2xsb3dNb3Rpb246IHRydWUsXG59KVxuXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHZpZXdlci5jb250YWluZXIpXG4iLCJ2YXIgU1ZHX05TID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJztcblxuXG5mdW5jdGlvbiBjcmVhdGVOb2RlICh0eXBlKSB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCB0eXBlKVxufVxuXG5cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZSAobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICBub2RlLnNldEF0dHJpYnV0ZU5TKG51bGwsIGF0dHJpYnV0ZSwgdmFsdWUpXG59XG5cblxuZnVuY3Rpb24gcm90YXRlKG91dCwgYSwgcmFkLCBheGlzKSB7XG4gICAgdmFyIHggPSBheGlzWzBdLCB5ID0gYXhpc1sxXSwgeiA9IGF4aXNbMl0sXG4gICAgICAgIGxlbiA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopLFxuICAgICAgICBzLCBjLCB0LFxuICAgICAgICBhMDAsIGEwMSwgYTAyLCBhMDMsXG4gICAgICAgIGExMCwgYTExLCBhMTIsIGExMyxcbiAgICAgICAgYTIwLCBhMjEsIGEyMiwgYTIzLFxuICAgICAgICBiMDAsIGIwMSwgYjAyLFxuICAgICAgICBiMTAsIGIxMSwgYjEyLFxuICAgICAgICBiMjAsIGIyMSwgYjIyO1xuXG4gICAgaWYgKE1hdGguYWJzKGxlbikgPCAwLjAwMDAwMSkgeyByZXR1cm4gbnVsbDsgfVxuICAgIFxuICAgIGxlbiA9IDEgLyBsZW47XG4gICAgeCAqPSBsZW47XG4gICAgeSAqPSBsZW47XG4gICAgeiAqPSBsZW47XG5cbiAgICBzID0gTWF0aC5zaW4ocmFkKTtcbiAgICBjID0gTWF0aC5jb3MocmFkKTtcbiAgICB0ID0gMSAtIGM7XG5cbiAgICBhMDAgPSBhWzBdOyBhMDEgPSBhWzFdOyBhMDIgPSBhWzJdOyBhMDMgPSBhWzNdO1xuICAgIGExMCA9IGFbNF07IGExMSA9IGFbNV07IGExMiA9IGFbNl07IGExMyA9IGFbN107XG4gICAgYTIwID0gYVs4XTsgYTIxID0gYVs5XTsgYTIyID0gYVsxMF07IGEyMyA9IGFbMTFdO1xuXG4gICAgLy8gQ29uc3RydWN0IHRoZSBlbGVtZW50cyBvZiB0aGUgcm90YXRpb24gbWF0cml4XG4gICAgYjAwID0geCAqIHggKiB0ICsgYzsgYjAxID0geSAqIHggKiB0ICsgeiAqIHM7IGIwMiA9IHogKiB4ICogdCAtIHkgKiBzO1xuICAgIGIxMCA9IHggKiB5ICogdCAtIHogKiBzOyBiMTEgPSB5ICogeSAqIHQgKyBjOyBiMTIgPSB6ICogeSAqIHQgKyB4ICogcztcbiAgICBiMjAgPSB4ICogeiAqIHQgKyB5ICogczsgYjIxID0geSAqIHogKiB0IC0geCAqIHM7IGIyMiA9IHogKiB6ICogdCArIGM7XG5cbiAgICAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFswXSA9IGEwMCAqIGIwMCArIGExMCAqIGIwMSArIGEyMCAqIGIwMjtcbiAgICBvdXRbMV0gPSBhMDEgKiBiMDAgKyBhMTEgKiBiMDEgKyBhMjEgKiBiMDI7XG4gICAgb3V0WzJdID0gYTAyICogYjAwICsgYTEyICogYjAxICsgYTIyICogYjAyO1xuICAgIG91dFszXSA9IGEwMyAqIGIwMCArIGExMyAqIGIwMSArIGEyMyAqIGIwMjtcbiAgICBvdXRbNF0gPSBhMDAgKiBiMTAgKyBhMTAgKiBiMTEgKyBhMjAgKiBiMTI7XG4gICAgb3V0WzVdID0gYTAxICogYjEwICsgYTExICogYjExICsgYTIxICogYjEyO1xuICAgIG91dFs2XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMjtcbiAgICBvdXRbN10gPSBhMDMgKiBiMTAgKyBhMTMgKiBiMTEgKyBhMjMgKiBiMTI7XG4gICAgb3V0WzhdID0gYTAwICogYjIwICsgYTEwICogYjIxICsgYTIwICogYjIyO1xuICAgIG91dFs5XSA9IGEwMSAqIGIyMCArIGExMSAqIGIyMSArIGEyMSAqIGIyMjtcbiAgICBvdXRbMTBdID0gYTAyICogYjIwICsgYTEyICogYjIxICsgYTIyICogYjIyO1xuICAgIG91dFsxMV0gPSBhMDMgKiBiMjAgKyBhMTMgKiBiMjEgKyBhMjMgKiBiMjI7XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVMb2dvIChvcHRpb25zXykge1xuXG5cdHZhciBjb250YWluZXIgPSBjcmVhdGVOb2RlKCdzdmcnKVxuXG5cdHNldEF0dHJpYnV0ZShjb250YWluZXIsICd3aWR0aCcsIDUwMCArICdweCcpXG5cdHNldEF0dHJpYnV0ZShjb250YWluZXIsICdoZWlnaHQnLCA1MDAgKyAncHgnKVxuXG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGFpbmVyKVxuXG5cdHZhciBOVU1fSEVYID0gMTI7XG5cblx0dmFyIGhleGVzID0gW11cbiAgICB2YXIgcmVjdGFuZ2xlcyA9IFtdXG5cblx0dmFyIG9mZnNldCA9IC03OFxuXG5cdHZhciB0dXJuUmF0ZSA9IDdcblxuXHR2YXIgZm9sbG93Q3Vyc29yID0gdHJ1ZS8vISFvcHRpb25zLmZvbGxvd01vdXNlXG4vL1x0dmFyIGZvbGxvd01vdGlvbiA9ICEhb3B0aW9ucy5mb2xsb3dNb3Rpb25cblx0Ly92YXIgc2xvd0RyaWZ0ID0gISFvcHRpb25zLnNsb3dEcmlmdFxuXHR2YXIgc2hvdWxkUmVuZGVyID0gdHJ1ZVxuXG5cblx0dmFyIFggPSBuZXcgRmxvYXQzMkFycmF5KFsxLCAwLCAwXSlcblx0dmFyIFkgPSBuZXcgRmxvYXQzMkFycmF5KFswLCAxLCAwXSlcblx0dmFyIFogPSBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAxXSlcblxuICAgIGZ1bmN0aW9uIHJhZChhKXtcblx0XHRyZXR1cm4gYSpNYXRoLlBJKjIvMzYwO1xuXHR9XG5cbiAgICBmdW5jdGlvbiBQb2x5Z29uIChzdmcpIHtcbiAgICAgICAgdGhpcy5zdmcgPSBzdmdcbiAgICB9XG5cbiAgICBwb2x5Z29ucyA9IFtdXG5cbiAgICBsb2dvX2NvbG9ycyA9IFtcbiAgICAncmdiKDEyOSwxNTIsODQpJywgJ3JnYig3NywxNzUsNzYpJywgICdyZ2IoNzEsMTc4LDcyKScsICAncmdiKDcxLDE3OCw3MiknLCAgJ3JnYig3NywxNzUsNzYpJywgICdyZ2IoNzcsMTc0LDc2KScsIC8vYWxsIGludmlzaWJsZSBleGNlcHQgMXN0XG4gICAgJ3JnYigzNSwxNTcsODIpJywgICdyZ2IoMzUsMTU3LDgyKScsICAncmdiKDc1LDE3NSw3NiknLCAgJ3JnYig3NywxNzUsNzYpJywgICdyZ2IoNzcsMTc0LDc2KScsICAncmdiKDc3LDE3NCw3NiknLCAvLyBhbGwgdmlzaWJsZSBicmllZmx5IFxuICAgICdyZ2IoNzcsMTc0LDc2KScsICAncmdiKDc3LDE3NCw3NiknLCAgJ3JnYig3NywxNzQsNzYpJywgICdyZ2IoNzcsMTc0LDc2KScsICAncmdiKDc3LDE3NCw3NiknLCAgJ3JnYig3NywxNzQsNzYpJywgLy8gYWxsIGEgYml0IG1vcmUgdmlzaWJsZVxuICAgICdyZ2IoNzcsMTc0LDc2KScsICAncmdiKDEzMCwxMzcsNTcpJywgJ3JnYig3NywxNzQsNzYpJywgICdyZ2IoNzcsMTc0LDc2KScsICAncmdiKDc3LDE3NCw3NiknLCAgJ3JnYig3NywxNzQsNzYpJywgIFxuICAgICdyZ2IoMTI5LDE1Miw4MyknLCAncmdiKDEyNiwxMzQsNjEpJywgJ3JnYig3NywxNzQsNzYpJywgICdyZ2IoNzcsMTc0LDc2KScsICAncmdiKDc3LDE3NCw3NiknLCAgJ3JnYig3NywxNzQsNzYpJywgXG4gICAgJ3JnYig3NywxNzQsNzYpJywgICdyZ2IoMTI5LDEzNyw2NCknLCAncmdiKDEyOSwxMzcsNjIpJywgJ3JnYig3NywxNzQsNzYpJywgICdyZ2IoNzcsMTc0LDc2KScsICAncmdiKDc3LDE3NCw3NiknLCAgICAgICAgIFxuICAgICdyZ2IoNzcsMTc0LDc2KScsICAncmdiKDc4LDE3NCw3MyknLCAgJ3JnYigxMjksMTM2LDY5KScsICdyZ2IoOTQsMTcxLDcxKScsICAncmdiKDk0LDE3NSw3NyknLCAgJ3JnYig5NCwxNzIsNzEpJyxcbiAgICAncmdiKDc1LDE3Niw3NiknLCAgJ3JnYig3NCwxNzUsNzgpJywgICdyZ2IoMTI5LDEzNyw2NCknLCAncmdiKDEyOSwxMzcsNjQpJywgJ3JnYig5MSwxNzYsNzIpJywgICdyZ2IoOTEsMTc2LDcyKScsICAgLy8gZnJvbnRcbiAgICAncmdiKDc4LDE3NCw3NiknLCAgJ3JnYig3OCwxNzQsNzYpJywgICdyZ2IoMTA4LDE0NSw3NSknLCAncmdiKDEyOSwxMzcsNjQpJywgJ3JnYigxMjksMTM3LDY0KScsICdyZ2IoOTEsMTc2LDcyKScsICAgLy8gZnJvbnQgYWxzb1xuICAgICdyZ2IoNDEsMTc3LDExMyknLCAncmdiKDM1LDE1Nyw4MiknLCAgJ3JnYigxMDYsMTQ2LDc1KScsICdyZ2IoMTE1LDEzMCw3MSknLCAncmdiKDEyOSwxMzcsNjQpJywgJ3JnYigxMjksMTUyLDg0KScsICAvLyBmcm9udCBhbHNvIGFsc29cbiAgICAncmdiKDQzLDE3NCwxMTYpJywgJ3JnYig0MiwxNzgsMTEyKScsICdyZ2IoNjksMTc2LDY4KScsICAncmdiKDExNSwxMzAsNzEpJywgJ3JnYigxMjksMTM3LDYyKScsICdyZ2IoMjIxLDEzNiwxMjIpJywgLy8gZnJvbnQgaGVyZSB0b29cbiAgICAncmdiKDg5LDE3OCw2OCknLCAgJ3JnYig0MSwxNzcsMTIwKScsICdyZ2IoMzUsMTU3LDgyKScsICAncmdiKDEwNiwxNDYsNzUpJywgJ3JnYigxMTUsMTMwLDcxKScsICdyZ2IoMTI5LDEzNyw2NCknLCAgLy8gbW9zdGx5IFwiZWRnZSBzcGlyYWxcIlxuXHRdXG5cblxuXG4gICBcdGN1cnJlbnRDb2xvciA9IDBcbiAgIFx0ZnVuY3Rpb24geWllbGRDb2xvcigpIHtcbiAgIFx0XHRjdXJyZW50Q29sb3IgPSAoY3VycmVudENvbG9yICsgMSkgJSBsb2dvX2NvbG9ycy5sZW5ndGhcbiAgIFx0XHRyZXR1cm4gbG9nb19jb2xvcnNbY3VycmVudENvbG9yXVxuICAgXHR9XG5cbiAgICB2YXIgbW91c2UgPSB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMFxuICAgIH1cbiAgICBcblx0ZnVuY3Rpb24gY3JlYXRlUmVjdCh4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQpIHtcblx0XHR2YXIgcmVjdCA9IGNyZWF0ZU5vZGUoJ3BvbHlnb24nKVxuXHRcdHNldEF0dHJpYnV0ZShyZWN0LCAncG9pbnRzJywgeDEgKyBcIixcIiArIHkxICsgJyAnICsgeDIgKyAnLCcgKyB5MiArIFwiIFwiICsgeDMgKyAnLCcgKyB5MyArICcgJyArIHg0ICsnLCcgKyB5NClcblx0XHRzZXRBdHRyaWJ1dGUocmVjdCwgJ3N0eWxlJywgXCJmaWxsOlwiICsgeWllbGRDb2xvcigpICsgXCI7c3Ryb2tlOmJsYWNrO3N0cm9rZS13aWR0aDouNlwiKVxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZWN0KVxuXHRcdHJldHVybiByZWN0XG5cdH1cblxuXHRmdW5jdGlvbiB1cGRhdGVSZWN0KHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCwgcG9seWdvbikge1xuXHRcdHNldEF0dHJpYnV0ZShwb2x5Z29uLnN2ZywgJ3BvaW50cycsIHgxICsgXCIsXCIgKyB5MSArICcgJyArIHgyICsgJywnICsgeTIgKyBcIiBcIiArIHgzICsgJywnICsgeTMgKyAnICcgKyB4NCArJywnICsgeTQpXG5cdH1cblxuXHRmdW5jdGlvbiBidWlsZEFubnVsdXMobXJhZCxocmFkKSB7XG5cdFx0aGV4ZXMgPSBbXVxuICAgICAgICBhbmdsZXMgPSBbXVxuXHQgICAgLy8gYnVpbGQgdGhlIHJpbmdcblx0XHRmb3IobGV0IGhleGl0ciA9IDA7IGhleGl0ciA8IE5VTV9IRVg7ICsraGV4aXRyKSB7XG5cdFx0XHQvL2ZpbmQgY2VudHJvaWRzIG9mIGhleGFnb25zXG5cdFx0XHRsZXQgY2FuZyA9IGhleGl0ciozNjAvTlVNX0hFWDtcblx0XHRcdGxldCBjZW50cm9pZCA9IHtcblx0XHRcdFx0eDpNYXRoLmNvcyhyYWQoY2FuZyArIG9mZnNldCkpKm1yYWQsXG5cdFx0XHRcdHk6TWF0aC5zaW4ocmFkKGNhbmcgKyBvZmZzZXQpKSptcmFkLFxuXHRcdFx0XHR6Oi1ocmFkLzIgLy8gc2hpZnQgYmFjayBzbyB0aGF0IHkgcGxhbmUgaW50ZXJzZWN0cyBcInNoaWZ0XCIgcm90YXRpb25hbCBheGlzLlxuXHRcdFx0fTtcbiAgICAgICAgICAgIGFuZ2xlcy5wdXNoKGNhbmcgKyBvZmZzZXQpXG4gICAgICAgICAgICBoZXggPSBbXVxuXHQgICAgICAgIGZvcihsZXQgdmVydGV4ID0gMDsgdmVydGV4IDwgNjsgKyt2ZXJ0ZXgpIHtcblx0ICAgICAgICAgICAgaGV4LnB1c2goW1xuXHQgICAgICAgICAgICBcdGNlbnRyb2lkLngsIFxuXHQgICAgICAgICAgICBcdE1hdGguc2luKHJhZCh2ZXJ0ZXggKiA2MCkpICogaHJhZCArIGNlbnRyb2lkLnksXG5cdCAgICAgICAgICAgIFx0TWF0aC5jb3MocmFkKHZlcnRleCAqIDYwKSkgKiBocmFkICsgaHJhZC8yXG5cdCAgICAgICAgICAgIF0pXG5cdCAgICAgICAgfVxuXHQgICAgICAgIGhleGVzLnB1c2goaGV4KVxuXHQgICAgfVxuXHR9XG5cblx0ZnVuY3Rpb24gc2hpZnRNb2JpdXMoKSB7XG5cdFx0Zm9yIChoZXhpdHIgPSAwOyBoZXhpdHIgPCBoZXhlcy5sZW5ndGg7ICsraGV4aXRyKSB7XG5cdCAgICAgICAgWFRyYW4gPSBoZXhlc1toZXhpdHJdWzJdWzBdXG5cdCAgICAgICAgbWF0MSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xuXHQgICAgICAgIFx0aGV4ZXNbaGV4aXRyXVswXVswXSAtIFhUcmFuLCBoZXhlc1toZXhpdHJdWzFdWzBdIC0gWFRyYW4sIGhleGVzW2hleGl0cl1bMl1bMF0gLSBYVHJhbiwgMSxcblx0ICAgICAgICBcdGhleGVzW2hleGl0cl1bMF1bMV0sICAgICAgICAgaGV4ZXNbaGV4aXRyXVsxXVsxXSwgICAgICAgICBoZXhlc1toZXhpdHJdWzJdWzFdLCAgICAgICAgIDEsXG5cdCAgICAgICAgXHRoZXhlc1toZXhpdHJdWzBdWzJdLCAgICAgICAgIGhleGVzW2hleGl0cl1bMV1bMl0sICAgICAgICAgaGV4ZXNbaGV4aXRyXVsyXVsyXSwgICAgICAgICAxLFxuXHQgICAgICAgIFx0MSwgICAgICAgICAgICAgICAgICAgICAgICAgICAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgMVxuXHQgICAgICAgIF0pO1xuXG5cdCAgICAgICAgbWF0MiA9IG5ldyBGbG9hdDMyQXJyYXkoW1xuXHQgICAgICAgIFx0aGV4ZXNbaGV4aXRyXVszXVswXSAtIFhUcmFuLCBoZXhlc1toZXhpdHJdWzRdWzBdIC0gWFRyYW4sIGhleGVzW2hleGl0cl1bNV1bMF0gLSBYVHJhbiwgMSxcblx0ICAgICAgICBcdGhleGVzW2hleGl0cl1bM11bMV0sICAgICAgICAgaGV4ZXNbaGV4aXRyXVs0XVsxXSwgICAgICAgICBoZXhlc1toZXhpdHJdWzVdWzFdLCAgICAgICAgIDEsXG5cdCAgICAgICAgXHRoZXhlc1toZXhpdHJdWzNdWzJdLCAgICAgICAgIGhleGVzW2hleGl0cl1bNF1bMl0sICAgICAgICAgaGV4ZXNbaGV4aXRyXVs1XVsyXSwgICAgICAgICAxLFxuXHQgICAgICAgIFx0MSwgICAgICAgICAgICAgICAgICAgICAgICAgICAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgMVxuXHQgICAgICAgIF0pO1xuXG5cdCAgICAgXHRyb3RhdGUobWF0MSwgbWF0MSwgcmFkKDYwKSwgWSk7XG5cdFx0XHRyb3RhdGUobWF0MiwgbWF0MiwgcmFkKDYwKSwgWSk7XG5cblx0IFx0XHRoZXhlc1toZXhpdHJdWzBdWzBdID0gbWF0MVswXSArIFhUcmFuOyBoZXhlc1toZXhpdHJdWzFdWzBdID0gbWF0MVsxXSArIFhUcmFuOyBoZXhlc1toZXhpdHJdWzJdWzBdID0gbWF0MVsyXSArIFhUcmFuO1xuXHQgXHRcdGhleGVzW2hleGl0cl1bMF1bMV0gPSBtYXQxWzRdOyAgICAgICAgIGhleGVzW2hleGl0cl1bMV1bMV0gPSBtYXQxWzVdOyAgICAgICAgIGhleGVzW2hleGl0cl1bMl1bMV0gPSBtYXQxWzZdO1xuXHQgXHRcdGhleGVzW2hleGl0cl1bMF1bMl0gPSBtYXQxWzhdOyAgICAgICAgIGhleGVzW2hleGl0cl1bMV1bMl0gPSBtYXQxWzldOyAgICAgICAgIGhleGVzW2hleGl0cl1bMl1bMl0gPSBtYXQxWzEwXTtcblxuXHQgXHRcdGhleGVzW2hleGl0cl1bM11bMF0gPSBtYXQyWzBdICsgWFRyYW47IGhleGVzW2hleGl0cl1bNF1bMF0gPSBtYXQyWzFdICsgWFRyYW47IGhleGVzW2hleGl0cl1bNV1bMF0gPSBtYXQyWzJdICsgWFRyYW47XG5cdCBcdFx0aGV4ZXNbaGV4aXRyXVszXVsxXSA9IG1hdDJbNF07ICAgICAgICAgaGV4ZXNbaGV4aXRyXVs0XVsxXSA9IG1hdDJbNV07ICAgICAgICAgaGV4ZXNbaGV4aXRyXVs1XVsxXSA9IG1hdDJbNl07XG5cdCBcdFx0aGV4ZXNbaGV4aXRyXVszXVsyXSA9IG1hdDJbOF07ICAgICAgICAgaGV4ZXNbaGV4aXRyXVs0XVsyXSA9IG1hdDJbOV07ICAgICAgICAgaGV4ZXNbaGV4aXRyXVs1XVsyXSA9IG1hdDJbMTBdO1xuXG5cdFx0fVxuXHR9XG5cblxuXG5cbiAgICBmdW5jdGlvbiBuZXh0SGV4KGN1cnJlbnRIZXgpe1xuICAgIFx0aWYgKGN1cnJlbnRIZXggPCBoZXhlcy5sZW5ndGggLSAxKSB7XG4gICAgXHRcdHJldHVybiBjdXJyZW50SGV4ICsgMTtcbiAgICBcdH1cbiAgICBcdGVsc2Uge1xuICAgIFx0ICAgIHJldHVybiAwXG4gICAgXHR9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJldkhleChjdXJyZW50SGV4KSB7XG4gICAgICAgIGlmIChjdXJyZW50SGV4ID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRIZXggLSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGhleGVzLmxlbmd0aCAtMVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbmV4dFZlcnRleChjdXJyZW50VmVydGV4KSB7XG4gICAgXHRpZiAoY3VycmVudFZlcnRleCA+IDApIHtcbiAgICBcdFx0cmV0dXJuIGN1cnJlbnRWZXJ0ZXggLSAxXG4gICAgXHR9XG4gICAgXHRlbHNlIHsgcmV0dXJuIDUgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByZXZWZXJ0ZXgoY3VycmVudFZlcnRleCkge1xuICAgICAgICBpZiAoY3VycmVudFZlcnRleCA8IDUpIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50VmVydGV4ICsgMVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBvbHlnb25zID0gW11cblxuXG5cdGZ1bmN0aW9uIGJ1aWxkUG9seWdvbnMoKSB7XG4gICAgZm9yIChsZXQgbG9vcHMgPSAwOyBsb29wcyA8IDY7IGxvb3BzKyspIHtcbiAgICAgIGhleGl0ciA9ICgobG9vcHMgKzE3KSAqIDkpICUgMTE7IC8vIHRoZSBtYWdpY1xuICAgICAgZm9yKGhleGVzRHJhd24gPSAwOyBoZXhlc0RyYXduIDwgMTI7IGhleGVzRHJhd24rKykge1xuICAgICAgICBwb2x5Z29ucy5wdXNoKCBcbiAgICAgICAgICBuZXcgUG9seWdvbihcblx0XHRcdFx0ICAgIGNyZWF0ZVJlY3QoXG4gIFx0XHQgICAgICAgIGhleGVzW2hleGl0cl1bbG9vcHNdWzBdICsgMjAwLCBoZXhlc1toZXhpdHJdW2xvb3BzXVsxXSArIDIwMCwgXG4gIFx0XHQgICAgICAgIGhleGVzW25leHRIZXgoaGV4aXRyKV1bbG9vcHNdWzBdICsgMjAwLCBoZXhlc1tuZXh0SGV4KGhleGl0cildW2xvb3BzXVsxXSArIDIwMCxcbiAgXHRcdCAgICAgICAgaGV4ZXNbbmV4dEhleChoZXhpdHIpXVtuZXh0VmVydGV4KGxvb3BzKV1bMF0gKyAyMDAsIGhleGVzW25leHRIZXgoaGV4aXRyKV1bbmV4dFZlcnRleChsb29wcyldWzFdICsgMjAwLFxuICBcdFx0ICAgICAgICBoZXhlc1toZXhpdHJdW25leHRWZXJ0ZXgobG9vcHMpXVswXSArIDIwMCwgaGV4ZXNbaGV4aXRyXVtuZXh0VmVydGV4KGxvb3BzKV1bMV0gKyAyMDBcbiAgXHRcdCAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG5cdFx0ICAgIGhleGl0ciA9IG5leHRIZXgoaGV4aXRyKTtcblx0XHRcdH1cbiAgICB9XG5cdH1cblxuXG5cblx0ZnVuY3Rpb24gdXBkYXRlUG9seWdvbnMoKSB7XG4gICAgZm9yIChsZXQgbG9vcHMgPSAwOyBsb29wcyA8IDY7IGxvb3BzKyspIHtcbiAgICAgICAgaGV4aXRyID0gKChsb29wcysxNykgKiA5KSAlIDExOyAgLy8gdGhlIG1hZ2ljXG4gICAgICAgIGZvcihoZXhlc0RyYXduID0gMDsgaGV4ZXNEcmF3biA8IDEyOyBoZXhlc0RyYXduKyspIHtcblx0XHRcdCBcdCAgICB1cGRhdGVSZWN0KCAvLyBmcm9udCB2aWV3XG5cdFx0ICAgICAgICBcdCAgICBoZXhlc1toZXhpdHJdW2xvb3BzXVswXSArIDIwMCwgaGV4ZXNbaGV4aXRyXVtsb29wc11bMV0gKyAyMDAsIFxuXHRcdCAgICAgICAgICAgICBcdGhleGVzW25leHRIZXgoaGV4aXRyKV1bbG9vcHNdWzBdICsgMjAwLCBoZXhlc1tuZXh0SGV4KGhleGl0cildW2xvb3BzXVsxXSArIDIwMCxcblx0XHQgICAgICAgIFx0ICAgIGhleGVzW25leHRIZXgoaGV4aXRyKV1bbmV4dFZlcnRleChsb29wcyldWzBdICsgMjAwLCBoZXhlc1tuZXh0SGV4KGhleGl0cildW25leHRWZXJ0ZXgobG9vcHMpXVsxXSArIDIwMCxcblx0XHQgICAgICAgIFx0ICAgIGhleGVzW2hleGl0cl1bbmV4dFZlcnRleChsb29wcyldWzBdICsgMjAwLCBoZXhlc1toZXhpdHJdW25leHRWZXJ0ZXgobG9vcHMpXVsxXSArIDIwMCxcblx0XHQgICAgICAgIFx0ICAgIHBvbHlnb25zWygoaGV4ZXNEcmF3biAqIDYpICsgbG9vcHMpICUgNzJdXG5cdFx0ICAgICAgICAgICAgKTtcdFx0XHRcbiAgICAgICAgICAgIGhleGl0ciA9IG5leHRIZXgoaGV4aXRyKTtcbiAgICAgICAgICAgIH1cblx0ICAgIH1cblx0fVxuXG5cbiAgZnVuY3Rpb24gc2V0VHVyblRvKHRhcmdldCkge1xuICAgIHZhciBib3VuZHMgPSBjb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgbW91c2UueCA9IDEuMCAtIDIuMCAqICh0YXJnZXQueCAtIGJvdW5kcy5sZWZ0KSAvIGJvdW5kcy53aWR0aDtcbiAgICBtb3VzZS55ID0gMS4wIC0gMi4wICogKHRhcmdldC55IC0gYm91bmRzLnRvcCkgLyBib3VuZHMuaGVpZ2h0O1xuICB9XG5cblx0ZnVuY3Rpb24gc3RvcEFuaW1hdGlvbigpIHsgc2hvdWxkUmVuZGVyID0gZmFsc2UgfVxuXHRmdW5jdGlvbiBzdGFydEFuaW1hdGlvbigpIHsgc2hvdWxkUmVuZGVyID0gdHJ1ZSB9XG5cdGZ1bmN0aW9uIHNldEZvbGxvd01vdXNlIChzdGF0ZSkgeyBmb2xsb3dDdXJzb3IgPSBzdGF0ZSB9XG5cdGZ1bmN0aW9uIHNldEZvbGxvd01vdGlvbiAoc3RhdGUpIHsgZm9sbG93TW90aW9uID0gc3RhdGUgfVx0XG5cbiAgdmFyIGxvYWRlZCA9IGZhbHNlXG5cdHZhciBwcmV2aW91c01vdXNlWSA9IDBcblx0dmFyIHByZXZpb3VzTW91c2VYID0gMFxuXG5cdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZXYpIHtcblx0XHRpZiAoIXNob3VsZFJlbmRlcikgeyBzdGFydEFuaW1hdGlvbigpIH1cdFx0XG5cdCAgXHRpZiAoZm9sbG93Q3Vyc29yKSB7XG4gICAgICBcdFx0c2V0VHVyblRvKHtcbiAgICAgICAgXHRcdHg6IGV2LmNsaWVudFgsXG4gICAgICAgXHRcdFx0eTogZXYuY2xpZW50WSxcbiAgIFx0XHRcdH0pXG4gXHQgIFx0XHRpZiAoIWxvYWRlZCkge1xuXHQgIFx0XHRcdHByZXZpb3VzTW91c2VYID0gbW91c2UueFxuXHQgIFx0XHRcdHByZXZpb3VzTW91c2VZID0gbW91c2UueVxuXHQgIFx0XHRcdGxvYWRlZCA9IHRydWVcblx0ICBcdFx0fVxuXHQgICBcdFx0cmVuZGVyU2NlbmUoKVxuXHRcdH1cdFxuXHR9KVxuXG5cdGZ1bmN0aW9uIHJlbmRlclNjZW5lICgpIHtcblx0XHRpZiAoIXNob3VsZFJlbmRlcikgcmV0dXJuXG5cdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJTY2VuZSlcblx0XHRvZmZzZXQgPSBcblx0XHRcdG9mZnNldCAtIFxuXHRcdFx0XHQoTWF0aC5hYnMoXG5cdFx0XHRcdFx0KE1hdGguc3FydChNYXRoLmFicyhNYXRoLmFicyhwcmV2aW91c01vdXNlWSkgLSBNYXRoLmFicyhtb3VzZS55KSkpKSArIFxuXHRcdFx0XHRcdChNYXRoLnNxcnQoTWF0aC5hYnMoTWF0aC5hYnMocHJldmlvdXNNb3VzZVgpIC0gTWF0aC5hYnMobW91c2UueCkpKSkpICogXG5cdFx0XHRcdHR1cm5SYXRlKTtcblx0XHRwcmV2aW91c01vdXNlWSA9IG1vdXNlLnk7XG5cdFx0cHJldmlvdXNNb3VzZVggPSBtb3VzZS54O1xuXG4gICBcdGJ1aWxkQW5udWx1cygxMDAsNTApO1xuXHRcdHNoaWZ0TW9iaXVzKCk7XG5cdFx0dXBkYXRlUG9seWdvbnMoKTtcbiBcdFx0c3RvcEFuaW1hdGlvbigpO1xuXHR9XG5cbiAgICBidWlsZEFubnVsdXMoMTAwLDUwKTtcbiAgICBzaGlmdE1vYml1cygpO1xuICAgIGJ1aWxkUG9seWdvbnMoKTtcbiAgXHRyZW5kZXJTY2VuZSgpO1xuXG4gIHJldHVybiB7XG4gICAgY29udGFpbmVyOiBjb250YWluZXIsXG4gICAgdHVyblRvOiBzZXRUdXJuVG8sXG4gICAgc2V0Rm9sbG93TW91c2U6IHNldEZvbGxvd01vdXNlLFxuICAgIHNldEZvbGxvd01vdGlvbjogc2V0Rm9sbG93TW90aW9uLFxuICAgIHN0b3BBbmltYXRpb246IHN0b3BBbmltYXRpb24sXG4gICAgc3RhcnRBbmltYXRpb246IHN0YXJ0QW5pbWF0aW9uLFxuICB9XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBkZXNlbGVjdEN1cnJlbnQgPSByZXF1aXJlKFwidG9nZ2xlLXNlbGVjdGlvblwiKTtcblxudmFyIGRlZmF1bHRNZXNzYWdlID0gXCJDb3B5IHRvIGNsaXBib2FyZDogI3trZXl9LCBFbnRlclwiO1xuXG5mdW5jdGlvbiBmb3JtYXQobWVzc2FnZSkge1xuICB2YXIgY29weUtleSA9ICgvbWFjIG9zIHgvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpID8gXCLijJhcIiA6IFwiQ3RybFwiKSArIFwiK0NcIjtcbiAgcmV0dXJuIG1lc3NhZ2UucmVwbGFjZSgvI3tcXHMqa2V5XFxzKn0vZywgY29weUtleSk7XG59XG5cbmZ1bmN0aW9uIGNvcHkodGV4dCwgb3B0aW9ucykge1xuICB2YXIgZGVidWcsXG4gICAgbWVzc2FnZSxcbiAgICByZXNlbGVjdFByZXZpb3VzLFxuICAgIHJhbmdlLFxuICAgIHNlbGVjdGlvbixcbiAgICBtYXJrLFxuICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9XG4gIGRlYnVnID0gb3B0aW9ucy5kZWJ1ZyB8fCBmYWxzZTtcbiAgdHJ5IHtcbiAgICByZXNlbGVjdFByZXZpb3VzID0gZGVzZWxlY3RDdXJyZW50KCk7XG5cbiAgICByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgc2VsZWN0aW9uID0gZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCk7XG5cbiAgICBtYXJrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgbWFyay50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgLy8gcmVzZXQgdXNlciBzdHlsZXMgZm9yIHNwYW4gZWxlbWVudFxuICAgIG1hcmsuc3R5bGUuYWxsID0gXCJ1bnNldFwiO1xuICAgIC8vIHByZXZlbnRzIHNjcm9sbGluZyB0byB0aGUgZW5kIG9mIHRoZSBwYWdlXG4gICAgbWFyay5zdHlsZS5wb3NpdGlvbiA9IFwiZml4ZWRcIjtcbiAgICBtYXJrLnN0eWxlLnRvcCA9IDA7XG4gICAgbWFyay5zdHlsZS5jbGlwID0gXCJyZWN0KDAsIDAsIDAsIDApXCI7XG4gICAgLy8gdXNlZCB0byBwcmVzZXJ2ZSBzcGFjZXMgYW5kIGxpbmUgYnJlYWtzXG4gICAgbWFyay5zdHlsZS53aGl0ZVNwYWNlID0gXCJwcmVcIjtcbiAgICAvLyBkbyBub3QgaW5oZXJpdCB1c2VyLXNlbGVjdCAoaXQgbWF5IGJlIGBub25lYClcbiAgICBtYXJrLnN0eWxlLndlYmtpdFVzZXJTZWxlY3QgPSBcInRleHRcIjtcbiAgICBtYXJrLnN0eWxlLk1velVzZXJTZWxlY3QgPSBcInRleHRcIjtcbiAgICBtYXJrLnN0eWxlLm1zVXNlclNlbGVjdCA9IFwidGV4dFwiO1xuICAgIG1hcmsuc3R5bGUudXNlclNlbGVjdCA9IFwidGV4dFwiO1xuICAgIG1hcmsuYWRkRXZlbnRMaXN0ZW5lcihcImNvcHlcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGlmIChvcHRpb25zLmZvcm1hdCkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuY2xpcGJvYXJkRGF0YS5jbGVhckRhdGEoKTtcbiAgICAgICAgZS5jbGlwYm9hcmREYXRhLnNldERhdGEob3B0aW9ucy5mb3JtYXQsIHRleHQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXJrKTtcblxuICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhtYXJrKTtcbiAgICBzZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpO1xuXG4gICAgdmFyIHN1Y2Nlc3NmdWwgPSBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIik7XG4gICAgaWYgKCFzdWNjZXNzZnVsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjb3B5IGNvbW1hbmQgd2FzIHVuc3VjY2Vzc2Z1bFwiKTtcbiAgICB9XG4gICAgc3VjY2VzcyA9IHRydWU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGRlYnVnICYmIGNvbnNvbGUuZXJyb3IoXCJ1bmFibGUgdG8gY29weSB1c2luZyBleGVjQ29tbWFuZDogXCIsIGVycik7XG4gICAgZGVidWcgJiYgY29uc29sZS53YXJuKFwidHJ5aW5nIElFIHNwZWNpZmljIHN0dWZmXCIpO1xuICAgIHRyeSB7XG4gICAgICB3aW5kb3cuY2xpcGJvYXJkRGF0YS5zZXREYXRhKG9wdGlvbnMuZm9ybWF0IHx8IFwidGV4dFwiLCB0ZXh0KTtcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZGVidWcgJiYgY29uc29sZS5lcnJvcihcInVuYWJsZSB0byBjb3B5IHVzaW5nIGNsaXBib2FyZERhdGE6IFwiLCBlcnIpO1xuICAgICAgZGVidWcgJiYgY29uc29sZS5lcnJvcihcImZhbGxpbmcgYmFjayB0byBwcm9tcHRcIik7XG4gICAgICBtZXNzYWdlID0gZm9ybWF0KFwibWVzc2FnZVwiIGluIG9wdGlvbnMgPyBvcHRpb25zLm1lc3NhZ2UgOiBkZWZhdWx0TWVzc2FnZSk7XG4gICAgICB3aW5kb3cucHJvbXB0KG1lc3NhZ2UsIHRleHQpO1xuICAgIH1cbiAgfSBmaW5hbGx5IHtcbiAgICBpZiAoc2VsZWN0aW9uKSB7XG4gICAgICBpZiAodHlwZW9mIHNlbGVjdGlvbi5yZW1vdmVSYW5nZSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgc2VsZWN0aW9uLnJlbW92ZVJhbmdlKHJhbmdlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWFyaykge1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChtYXJrKTtcbiAgICB9XG4gICAgcmVzZWxlY3RQcmV2aW91cygpO1xuICB9XG5cbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29weTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWxlY3Rpb24gPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKTtcbiAgaWYgKCFzZWxlY3Rpb24ucmFuZ2VDb3VudCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7fTtcbiAgfVxuICB2YXIgYWN0aXZlID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblxuICB2YXIgcmFuZ2VzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0aW9uLnJhbmdlQ291bnQ7IGkrKykge1xuICAgIHJhbmdlcy5wdXNoKHNlbGVjdGlvbi5nZXRSYW5nZUF0KGkpKTtcbiAgfVxuXG4gIHN3aXRjaCAoYWN0aXZlLnRhZ05hbWUudG9VcHBlckNhc2UoKSkgeyAvLyAudG9VcHBlckNhc2UgaGFuZGxlcyBYSFRNTFxuICAgIGNhc2UgJ0lOUFVUJzpcbiAgICBjYXNlICdURVhUQVJFQSc6XG4gICAgICBhY3RpdmUuYmx1cigpO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgYWN0aXZlID0gbnVsbDtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHNlbGVjdGlvbi50eXBlID09PSAnQ2FyZXQnICYmXG4gICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuXG4gICAgaWYgKCFzZWxlY3Rpb24ucmFuZ2VDb3VudCkge1xuICAgICAgcmFuZ2VzLmZvckVhY2goZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGFjdGl2ZSAmJlxuICAgIGFjdGl2ZS5mb2N1cygpO1xuICB9O1xufTtcbiJdfQ==

var SVG_NS = 'http://www.w3.org/2000/svg';
var rotate = require('gl-mat4/rotate')


function createNode (type) {
  return document.createElementNS(SVG_NS, type)
}


function setAttribute (node, attribute, value) {
  node.setAttributeNS(null, attribute, value)
}


module.exports = function createLogo (options_) {
  var options = options_ || {}


  var width = options.width || 400
  var height = options.height || 400

  var followCursor = !!options.followMouse
  var followMotion = !!options.followMotion
  var slowDrift = !!options.slowDrift
  var shouldRender = true

	var container = createNode('svg')

  if (!options.pxNotRatio) {
    width = (window.innerWidth * (options.width || 0.25)) | 0
    height = ((window.innerHeight * options.height) || width) | 0
    console.log("ASDFASDF")

    if ('minWidth' in options && width < options.minWidth) {
      width = options.minWidth
      height = (options.minWidth * options.height / options.width) | 0
    }
  }

  setAttribute(container, 'width', width + 'px')
  setAttribute(container, 'height', height + 'px')
	document.body.appendChild(container)

  var lineThickness = container.getBoundingClientRect().width * 0.0012
	var NUM_HEX = 12;

	var hexes = []
  var rectangles = []
	var offset = -78
	var turnRate = 7

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
		setAttribute(rect, 'style', "fill:" + yieldColor() + ";stroke:black;stroke-width:" + lineThickness)
		container.appendChild(rect)
		return rect
	}

	function updateRect(x1, y1, x2, y2, x3, y3, x4, y4, polygon) {
    setAttribute(polygon.svg, 'points', x1 + "," + y1 + ' ' + x2 + ',' + y2 + " " + x3 + ',' + y3 + ' ' + x4 +',' + y4);
	}

	function buildAnnulus(mrad,hrad,centerX,centerY) {
		hexes = []
    angles = []
    // build the ring
		for(let hexitr = 0; hexitr < NUM_HEX; ++hexitr) {
			//find centroids of hexagons
			let cang = hexitr*360/NUM_HEX;
			let centroid = {
				x:Math.cos(rad(cang + offset))*mrad + centerX + .425 * hrad,
				y:Math.sin(rad(cang + offset))*mrad + centerY,
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
      hexitr = ((loops +17) * 9) % 11; // the non-euclidian magic
      for(hexesDrawn = 0; hexesDrawn < 12; hexesDrawn++) {
        polygons.push( 
          new Polygon(
				    createRect(
  		        hexes[hexitr][loops][0], hexes[hexitr][loops][1], 
  		        hexes[nextHex(hexitr)][loops][0], hexes[nextHex(hexitr)][loops][1],
  		        hexes[nextHex(hexitr)][nextVertex(loops)][0], hexes[nextHex(hexitr)][nextVertex(loops)][1],
  		        hexes[hexitr][nextVertex(loops)][0], hexes[hexitr][nextVertex(loops)][1]
  		        )
            )
          );
		    hexitr = nextHex(hexitr);
			}
    }
	}


	function updatePolygons() {
    for (let loops = 0; loops < 6; loops++) {
        hexitr = ((loops+17) * 9) % 11;  // the non-euclidian magic
        for(hexesDrawn = 0; hexesDrawn < 12; hexesDrawn++) {
			 	    updateRect(
		        	    hexes[hexitr][loops][0], hexes[hexitr][loops][1], 
		             	hexes[nextHex(hexitr)][loops][0], hexes[nextHex(hexitr)][loops][1],
		        	    hexes[nextHex(hexitr)][nextVertex(loops)][0], hexes[nextHex(hexitr)][nextVertex(loops)][1],
		        	    hexes[hexitr][nextVertex(loops)][0], hexes[hexitr][nextVertex(loops)][1],
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

   	buildAnnulus(width/3,width/6, width/2, height/2);
		shiftMobius();
		updatePolygons();
 		stopAnimation();
	}

  console.log("left: " + container.getBoundingClientRect().left)
  console.log("bottom: " + container.getBoundingClientRect().bottom)

    buildAnnulus(width/3,width/6, width/2, height/2);
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
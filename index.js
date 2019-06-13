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

	document.body.appendChild(container)

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
		setAttribute(rect, 'style', "fill:" + yieldColor() + ";stroke:black;stroke-width:.6")
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
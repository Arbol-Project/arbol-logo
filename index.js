var SVG_NS = 'http://www.w3.org/2000/svg';
var rotate = require('gl-mat4/rotate');
var async = require("async"); 

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

  var followMouse = !!options.followMouse
  var followMotion = !!options.followMotion
  var slowDrift = !!options.slowDrift
  var shouldRender = true

	var container = createNode('svg')

  if (!options.pxNotRatio) {
    width = (window.innerWidth * (options.width || 0.25)) | 0
    height = ((window.innerHeight * options.height) || width) | 0

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

  var polygons = []
	var hexes = []
  var rectangles = []
	var offset = -78
	var turnRate = 3.5

	var X = new Float32Array([1, 0, 0])
	var Y = new Float32Array([0, 1, 0])
	var Z = new Float32Array([0, 0, 1])

  function rad(a) {
		return a * Math.PI * 2 / 360;
	}


 //  logo_colors = [
 //  'rgb(129,152,84)', 'rgb(77,175,76)',  'rgb(71,178,72)',  'rgb(71,178,72)',  'rgb(77,175,76)',  'rgb(77,174,76)', //all invisible except 1st
 //  'rgb(35,157,82)',  'rgb(35,157,82)',  'rgb(75,175,76)',  'rgb(77,175,76)',  'rgb(77,174,76)',  'rgb(77,174,76)', // all visible briefly 
 //  'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)', // all a bit more visible
 //  'rgb(77,174,76)',  'rgb(130,137,57)', 'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',  
 //  'rgb(129,152,83)', 'rgb(126,134,61)', 'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)', 
 //  'rgb(77,174,76)',  'rgb(129,137,64)', 'rgb(129,137,62)', 'rgb(77,174,76)',  'rgb(77,174,76)',  'rgb(77,174,76)',         
 //  'rgb(77,174,76)',  'rgb(78,174,73)',  'rgb(129,136,69)', 'rgb(94,171,71)',  'rgb(94,175,77)',  'rgb(94,172,71)',
 //  'rgb(75,176,76)',  'rgb(74,175,78)',  'rgb(129,137,64)', 'rgb(129,137,64)', 'rgb(91,176,72)',  'rgb(91,176,72)',   // front
 //  'rgb(78,174,76)',  'rgb(78,174,76)',  'rgb(108,145,75)', 'rgb(129,137,64)', 'rgb(129,137,64)', 'rgb(91,176,72)',   // front also
 //  'rgb(41,177,113)', 'rgb(35,157,82)',  'rgb(106,146,75)', 'rgb(115,130,71)', 'rgb(129,137,64)', 'rgb(129,152,84)',  // front also also
 //  'rgb(43,174,116)', 'rgb(42,178,112)', 'rgb(69,176,68)',  'rgb(115,130,71)', 'rgb(129,137,62)', 'rgb(221,136,122)', // front here too
 //  'rgb(89,178,68)',  'rgb(41,177,120)', 'rgb(35,157,82)',  'rgb(106,146,75)', 'rgb(115,130,71)', 'rgb(129,137,64)',  // mostly "edge spiral"

	// ]

  logo_colors = ['rgb(200,200,200)']



 	currentColor = 0
 	function yieldColor() {
 		currentColor = (currentColor + 1) % logo_colors.length
 		return logo_colors[currentColor]
 	}

  var mouse = {
    x: 0,
    y: 0
  }
    
  function Polygon (svg, zIndex) {
    this.svg = svg
    this.zIndex = zIndex
  }

  function compareZ (a, b) {
    return b.zIndex - a.zIndex
  }


	function createTriangle(x1, y1, x2, y2, x3, y3) {
		var tri = createNode('polygon')
		setAttribute(tri, 'points', x1 + "," + y1 + ' ' + x2 + ',' + y2 + " " + x3 + ',' + y3)
		setAttribute(tri, 'style', "fill:" + yieldColor() + ";stroke:black;stroke-width:" + lineThickness)
		container.appendChild(tri)
		return tri
	}

	function updateTri(x1, y1, x2, y2, x3, y3, polygon) {
    setAttribute(polygon.svg, 'points', x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3);
	}

  function updateColor(polygon, color) {
    setAttribute(polygon.svg, 'style', 'fill:' + color)
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

  function nextHex(currentHex) {
    return (currentHex + 1) % (hexes.length)
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

  VERT_CONST = 12.15
  function turnyRender(hex, vert) {
   return (Math.cos(rad(60 * vert - VERT_CONST)) * Math.sin(rad(30 * hex + offset))) + (Math.sin(rad(60 * vert - VERT_CONST)) * Math.cos(rad(30 * hex + offset)))
  }

	function buildPolygons() {
    for (let hexitr = 0; hexitr < hexes.length; hexitr++) {
      for (let vertitr = 0; vertitr < 6; vertitr++) {

        p1 = [hexes[hexitr][vertitr][0], hexes[hexitr][vertitr][1], hexes[hexitr][vertitr][2]]
        p2 = [hexes[nextHex(hexitr)][vertitr][0], hexes[nextHex(hexitr)][vertitr][1], hexes[nextHex(hexitr)][vertitr][2]]
        p3 = [hexes[nextHex(hexitr)][nextVertex(vertitr)][0], hexes[nextHex(hexitr)][nextVertex(vertitr)][1], hexes[nextHex(hexitr)][nextVertex(vertitr)][2]]
        p4 = [hexes[hexitr][nextVertex(vertitr)][0], hexes[hexitr][nextVertex(vertitr)][1], hexes[hexitr][nextVertex(vertitr)][2]]

        poly1ZMax = Math.max(Math.max(p1[2], p2[2]), p3[2])
        poly1ZMin = Math.min(Math.min(p1[2], p2[2]), p3[2])
        poly2ZMax = Math.max(Math.max(p1[2], p3[2]), p4[2])
        poly2ZMin = Math.min(Math.min(p1[2], p3[2]), p4[2])

        polygons.push(
          new Polygon(
            createTriangle(
              p1[0], p1[1],
              p2[0], p2[1],
              p3[0], p3[1]
            ),
            turnyRender(hexitr, vertitr)
          )
        )
        polygons.push(
          new Polygon(
            createTriangle(
              p1[0], p1[1],
              p3[0], p3[1], 
              p4[0], p4[1]
              ),
            turnyRender(hexitr, vertitr)

          )
        )
      }
    }
    polygons.sort(compareZ)
	}

	function updatePolygons() {
    for (let hexitr = 0; hexitr < hexes.length; hexitr++) {
      for (let vertitr = 0; vertitr < 6; vertitr++) {



        p1 = [hexes[hexitr][vertitr][0], hexes[hexitr][vertitr][1], hexes[hexitr][vertitr][2]]
        p2 = [hexes[nextHex(hexitr)][vertitr][0], hexes[nextHex(hexitr)][vertitr][1], hexes[nextHex(hexitr)][vertitr][2]]
        p3 = [hexes[nextHex(hexitr)][nextVertex(vertitr)][0], hexes[nextHex(hexitr)][nextVertex(vertitr)][1], hexes[nextHex(hexitr)][nextVertex(vertitr)][2]]
        p4 = [hexes[hexitr][nextVertex(vertitr)][0], hexes[hexitr][nextVertex(vertitr)][1], hexes[hexitr][nextVertex(vertitr)][2]]

        poly1ZMax = Math.max(Math.max(p1[2], p2[2]), p3[2])
        poly1ZMin = Math.min(Math.min(p1[2], p2[2]), p3[2])
        poly2ZMax = Math.max(Math.max(p1[2], p3[2]), p4[2])
        poly2ZMin = Math.min(Math.min(p1[2], p3[2]), p4[2])

        // if (vertitr == 1) {
        //   updateColor(polygons[(hexitr*6 + vertitr) * 2], 'rgb(100,200,300)' + ";stroke:black;stroke-width:" + lineThickness)
        //   updateColor(polygons[(hexitr*6 + vertitr) * 2 + 1], 'rgb(100,200,300)' + ";stroke:black;stroke-width:" + lineThickness)
        // }
        // else {
        //   updateColor(polygons[(hexitr*6 + vertitr) * 2], 'rgb(300, 300, 300)' + ";stroke:black;stroke-width:" + lineThickness)
        //   updateColor(polygons[(hexitr*6 + vertitr) * 2 + 1], 'rgb(300, 300, 300)' + ";stroke:black;stroke-width:" + lineThickness)
        // }


            updateTri(
              p1[0], p1[1],
              p2[0], p2[1],
              p3[0], p3[1],
              polygons[(hexitr*6 + vertitr) * 2] 
              )
         
            polygons[(hexitr*6 + vertitr) * 2].zIndex = turnyRender(hexitr, vertitr)

            updateTri(
              p1[0], p1[1],
              p3[0], p3[1], 
              p4[0], p4[1],
              polygons[(hexitr*6 + vertitr) * 2 + 1] 
              )

            polygons[(hexitr*6 + vertitr) * 2 + 1].zIndex = turnyRender(hexitr, vertitr) 

      }
    }
    polygons.sort(compareZ)
    for (i = 0; i < polygons.length; ++i) {
    //  console.log(polygons[i].zIndex)
      if (polygons[i].zIndex > 0) {
      container.appendChild(polygons[i].svg)
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
	function setFollowMouse (state) { followMouse = state }
	function setFollowMotion (state) { followMotion = state }	

  var loaded = false
	var previousMouseY = 0
	var previousMouseX = 0

	window.addEventListener('mousemove', function (ev) {
		if (!shouldRender) { startAnimation() }		
	  	if (followMouse) {
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

	function renderScene() {
		if (!shouldRender) return
		window.requestAnimationFrame(renderScene)

    if (followMouse) {
  		offset = 
  			offset - 
  				(Math.abs(
  					(Math.sqrt(Math.abs(Math.abs(previousMouseY) - Math.abs(mouse.y)))) + 
  					(Math.sqrt(Math.abs(Math.abs(previousMouseX) - Math.abs(mouse.x)))))* 
          turnRate
          );
  		previousMouseY = mouse.y;
  		previousMouseX = mouse.x;
    }
    else if (slowDrift) {
      offset = offset - Date.now() / 6000000000000.0
    }

   	buildAnnulus(width/3, width/6, width/2, height/2);
		shiftMobius();
		updatePolygons();
    if (!slowDrift) {
   		stopAnimation()
    }
	}

  buildAnnulus(width/3, width/6, width/2, height/2);
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
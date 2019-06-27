(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var detect = require('detect-browser').detect
var isMobile = !!detectMobile()

function detectMobile() {
  return (
      navigator.userAgent.match(/Android/i)
   || navigator.userAgent.match(/webOS/i)
   || navigator.userAgent.match(/iPhone/i)
   || navigator.userAgent.match(/iPad/i)
   || navigator.userAgent.match(/iPod/i)
   || navigator.userAgent.match(/BlackBerry/i)
   || navigator.userAgent.match(/Windows Phone/i)
  )
}

var createViewer = require('../index')

var viewer = createViewer({
  pxNotRatio: true,
  width: 500,
  height: 500,
  followMouse: !isMobile,
  slowDrift: isMobile,
})

document.body.appendChild(viewer.container)

},{"../index":2,"detect-browser":3}],2:[function(require,module,exports){
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
	var turnRate = 7

	var X = new Float32Array([1, 0, 0])
	var Y = new Float32Array([0, 1, 0])
	var Z = new Float32Array([0, 0, 1])

    function rad(a) {
		return a * Math.PI * 2 / 360;
	}

  function Polygon (svg) {
      this.svg = svg
  }

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
    setAttribute(polygon.svg, 'points', x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3 + ' ' + x4 +',' + y4);
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

	function buildPolygons() {
    for (let loops = 0; loops < 6; loops++) {
      hexitr = ((loops + 17) * 9) % 11; // the non-euclidian magic
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
      var time = (Date.now() / 1000.0)
      offset = offset - time
    }

   	buildAnnulus(width/3, width/6, width/2, height/2);
		shiftMobius();
		updatePolygons();
 		stopAnimation();
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
},{"gl-mat4/rotate":4}],3:[function(require,module,exports){
(function (process){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BrowserInfo = /** @class */ (function () {
    function BrowserInfo(name, version, os) {
        this.name = name;
        this.version = version;
        this.os = os;
    }
    return BrowserInfo;
}());
exports.BrowserInfo = BrowserInfo;
var NodeInfo = /** @class */ (function () {
    function NodeInfo(version) {
        this.version = version;
        this.name = 'node';
        this.os = process.platform;
    }
    return NodeInfo;
}());
exports.NodeInfo = NodeInfo;
var BotInfo = /** @class */ (function () {
    function BotInfo() {
        this.bot = true; // NOTE: deprecated test name instead
        this.name = 'bot';
        this.version = null;
        this.os = null;
    }
    return BotInfo;
}());
exports.BotInfo = BotInfo;
// tslint:disable-next-line:max-line-length
var SEARCHBOX_UA_REGEX = /alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/;
var SEARCHBOT_OS_REGEX = /(nuhk)|(Googlebot)|(Yammybot)|(Openbot)|(Slurp)|(MSNBot)|(Ask Jeeves\/Teoma)|(ia_archiver)/;
var REQUIRED_VERSION_PARTS = 3;
var userAgentRules = [
    ['aol', /AOLShield\/([0-9\._]+)/],
    ['edge', /Edge\/([0-9\._]+)/],
    ['yandexbrowser', /YaBrowser\/([0-9\._]+)/],
    ['vivaldi', /Vivaldi\/([0-9\.]+)/],
    ['kakaotalk', /KAKAOTALK\s([0-9\.]+)/],
    ['samsung', /SamsungBrowser\/([0-9\.]+)/],
    ['silk', /\bSilk\/([0-9._-]+)\b/],
    ['miui', /MiuiBrowser\/([0-9\.]+)$/],
    ['beaker', /BeakerBrowser\/([0-9\.]+)/],
    ['edge-chromium', /Edg\/([0-9\.]+)/],
    ['chromium-webview', /(?!Chrom.*OPR)wv\).*Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
    ['chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
    ['phantomjs', /PhantomJS\/([0-9\.]+)(:?\s|$)/],
    ['crios', /CriOS\/([0-9\.]+)(:?\s|$)/],
    ['firefox', /Firefox\/([0-9\.]+)(?:\s|$)/],
    ['fxios', /FxiOS\/([0-9\.]+)/],
    ['opera-mini', /Opera Mini.*Version\/([0-9\.]+)/],
    ['opera', /Opera\/([0-9\.]+)(?:\s|$)/],
    ['opera', /OPR\/([0-9\.]+)(:?\s|$)/],
    ['ie', /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/],
    ['ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],
    ['ie', /MSIE\s(7\.0)/],
    ['bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/],
    ['android', /Android\s([0-9\.]+)/],
    ['ios', /Version\/([0-9\._]+).*Mobile.*Safari.*/],
    ['safari', /Version\/([0-9\._]+).*Safari/],
    ['facebook', /FBAV\/([0-9\.]+)/],
    ['instagram', /Instagram\s([0-9\.]+)/],
    ['ios-webview', /AppleWebKit\/([0-9\.]+).*Mobile/],
    ['ios-webview', /AppleWebKit\/([0-9\.]+).*Gecko\)$/],
    ['searchbot', SEARCHBOX_UA_REGEX],
];
var operatingSystemRules = [
    ['iOS', /iP(hone|od|ad)/],
    ['Android OS', /Android/],
    ['BlackBerry OS', /BlackBerry|BB10/],
    ['Windows Mobile', /IEMobile/],
    ['Amazon OS', /Kindle/],
    ['Windows 3.11', /Win16/],
    ['Windows 95', /(Windows 95)|(Win95)|(Windows_95)/],
    ['Windows 98', /(Windows 98)|(Win98)/],
    ['Windows 2000', /(Windows NT 5.0)|(Windows 2000)/],
    ['Windows XP', /(Windows NT 5.1)|(Windows XP)/],
    ['Windows Server 2003', /(Windows NT 5.2)/],
    ['Windows Vista', /(Windows NT 6.0)/],
    ['Windows 7', /(Windows NT 6.1)/],
    ['Windows 8', /(Windows NT 6.2)/],
    ['Windows 8.1', /(Windows NT 6.3)/],
    ['Windows 10', /(Windows NT 10.0)/],
    ['Windows ME', /Windows ME/],
    ['Open BSD', /OpenBSD/],
    ['Sun OS', /SunOS/],
    ['Chrome OS', /CrOS/],
    ['Linux', /(Linux)|(X11)/],
    ['Mac OS', /(Mac_PowerPC)|(Macintosh)/],
    ['QNX', /QNX/],
    ['BeOS', /BeOS/],
    ['OS/2', /OS\/2/],
    ['Search Bot', SEARCHBOT_OS_REGEX],
];
function detect() {
    if (typeof navigator !== 'undefined') {
        return parseUserAgent(navigator.userAgent);
    }
    return getNodeVersion();
}
exports.detect = detect;
function parseUserAgent(ua) {
    // opted for using reduce here rather than Array#first with a regex.test call
    // this is primarily because using the reduce we only perform the regex
    // execution once rather than once for the test and for the exec again below
    // probably something that needs to be benchmarked though
    var matchedRule = ua !== '' &&
        userAgentRules.reduce(function (matched, _a) {
            var browser = _a[0], regex = _a[1];
            if (matched) {
                return matched;
            }
            var uaMatch = regex.exec(ua);
            return !!uaMatch && [browser, uaMatch];
        }, false);
    if (!matchedRule) {
        return null;
    }
    var name = matchedRule[0], match = matchedRule[1];
    if (name === 'searchbot') {
        return new BotInfo();
    }
    var versionParts = match[1] && match[1].split(/[._]/).slice(0, 3);
    if (versionParts) {
        if (versionParts.length < REQUIRED_VERSION_PARTS) {
            versionParts = versionParts.concat(createVersionParts(REQUIRED_VERSION_PARTS - versionParts.length));
        }
    }
    else {
        versionParts = [];
    }
    return new BrowserInfo(name, versionParts.join('.'), detectOS(ua));
}
exports.parseUserAgent = parseUserAgent;
function detectOS(ua) {
    for (var ii = 0, count = operatingSystemRules.length; ii < count; ii++) {
        var _a = operatingSystemRules[ii], os = _a[0], regex = _a[1];
        var match = regex.test(ua);
        if (match) {
            return os;
        }
    }
    return null;
}
exports.detectOS = detectOS;
function getNodeVersion() {
    var isNode = typeof process !== 'undefined' && process.version;
    return isNode ? new NodeInfo(process.version.slice(1)) : null;
}
exports.getNodeVersion = getNodeVersion;
function createVersionParts(count) {
    var output = [];
    for (var ii = 0; ii < count; ii++) {
        output.push('0');
    }
    return output;
}

}).call(this,require('_process'))
},{"_process":5}],4:[function(require,module,exports){
module.exports = rotate;

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
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
},{}],5:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);

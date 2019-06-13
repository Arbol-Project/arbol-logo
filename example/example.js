var copy = require('copy-to-clipboard')

document.addEventListener('keypress', function (event) {
  if (event.keyCode === 99) { // the c key
    var svg = document.querySelector('svg')
    var inner = svg.innerHTML
    var head = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" '
    + '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"> '
    + '<svg width="500px" height="500px" version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events">'
    var foot = '</svg>'

     var full = head + inner + foot;

     copy(full)
  }
})

var createViewer = require('../index')

var viewer = createViewer({
  pxNotRatio: true,
  width: 500,
  height: 500,
  followMouse: true,
  followMotion: true,
})

document.body.appendChild(viewer.container)

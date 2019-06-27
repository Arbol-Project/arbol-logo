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

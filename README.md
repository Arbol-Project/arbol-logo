# Arbol Logo

This repo can both be included as a browserifiable module, and includes a sample app.

The sample app address is `index.html`.
The sample app javascript is `bundle.js`, which is built from `examples/example.js` using the `build` task (see the `package.json`).

In other words, you edit `examples/example.js`, run `$browserify example/example.js -o bundle.js` and then load 'index.html' in the browser to view the logo. 

## API
```javascript
var ModelViewer = require('metamask-logo')

// To render with fixed dimensions:
var viewer = ModelViewer({

  // Dictates whether width & height are px or multiplied
  pxNotRatio: true,
  width: 500,
  height: 500,
  // pxNotRatio: false,
  // width: 0.9,
  // height: 0.9,

  // To make the shape follow the mouse.
  followMouse: false,

  // shape should slowly turn (TODO)
  slowDrift: false,

})

// add viewer to DOM
var container = document.getElementById('logo-container')
container.appendChild(viewer.container)

// enable mouse follow
viewer.setFollowMouse(true)

// deallocate nicely
viewer.stopAnimation()
```

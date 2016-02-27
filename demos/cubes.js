var context = require('gl-context')
var fit = require('canvas-fit')
var orbit = require('canvas-orbit-camera')
var extrude = require('extrude')

var canvas = document.body.appendChild(document.createElement('canvas'))
window.addEventListener('resize', fit(canvas), false)
var gl = context(canvas, tick)

var scene = require('../index.js')(gl)

var shapes = []
for (var i = 0; i < 50; i++) {
  shapes.push({
    complex: extrude([[0, 1], [1, 1], [1, 0], [0, 0]], {top: 1, bottom: 0}),
    position: [Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10],
    scale: Math.random() * 2 + 0.5,
    styles: {
      emissive: [Math.max(Math.random(), 0.3), 0, Math.max(Math.random(), 0.3)], 
      diffuse: [0.9, 0.9, 0.9]
    }
  })
}

scene.shapes(shapes)
scene.init()

var camera = orbit(canvas)

function tick () { 
  camera.tick()
  scene.draw(camera)
}
var context = require('gl-context')
var fit = require('canvas-fit')
var orbit = require('canvas-orbit-camera')
var icosphere = require('icosphere')

var canvas = document.body.appendChild(document.createElement('canvas'))
window.addEventListener('resize', fit(canvas), false)
var gl = context(canvas, tick)

var scene = require('../index.js')(gl)

var shapes = []
for (var i = 0; i < 200; i++) {
  shapes.push({
    complex: icosphere(3),
    position: [Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10],
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
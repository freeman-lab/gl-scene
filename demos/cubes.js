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
    className: 'cube',
    complex: extrude([[-1, 1], [1, 1], [1, -1], [-1, -1]], {top: 1, bottom: -1}),
    position: [Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10],
    scale: Math.random() + 0.5,
    styles: {
      emissive: [0, Math.max(Math.random(), 0.3), Math.max(Math.random(), 0.3)], 
      diffuse: [0.9, 0.9, 0.9]
    }
  })
}

var lights = [
  {
    position: [20, 20, 0, 0],
    styles: {intensity: 1.0}
  }
]

scene.shapes(shapes)
scene.lights(lights)
scene.init()

var camera = orbit(canvas)

var t = 0

function tick () { 
  camera.tick()
  scene.draw(camera)
  scene.selectAll('.cube').rotation(t, [1, 1, 1])
  t += 0.01
}
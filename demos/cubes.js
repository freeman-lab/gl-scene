var context = require('gl-context')
var fit = require('canvas-fit')
var orbit = require('canvas-orbit-camera')
var extrude = require('extrude')
var time = require('right-now')

var canvas = document.body.appendChild(document.createElement('canvas'))
window.addEventListener('resize', fit(canvas), false)
var gl = context(canvas, tick)

var scene = require('../index.js')(gl, {background: [0, 0, 0]})

var shapes = []
for (var i = 0; i < 50; i++) {
  shapes.push({
    class: 'cube',
    complex: extrude([[1, -1], [1, 1], [-1, 1], [-1, -1]], {top: 1, bottom: -1}),
    position: [Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10],
    scale: Math.random() + 0.5,
    styles: {
      emissive: [0, Math.max(Math.random(), 0.3), Math.max(Math.random(), 0.3)],
      diffuse: [0.5, 0.5, 0.5]
    }
  })
}

var lights = [
  {
    id: 'point',
    position: [10, 0, 0, 0],
    styles: {intensity: 10, ambient: 0}
  }
]

scene.shapes(shapes)
scene.lights(lights)
scene.init()

var camera = orbit(canvas)

var t = 0

var now = time() * 0.001
var rotate = 0.005
function tick () { 
  var axis = Math.sin(now) * 2
  camera.rotate([0, 0, 0], [axis * rotate, -rotate, 0])
  camera.tick()
  scene.draw(camera)
  scene.selectAll('.cube').rotation(-t, [0, 0, 1])
  t += 0.01
}
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
    className: 'sphere',
    complex: icosphere(3),
    position: [Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10],
    styles: {
      emissive: [Math.max(Math.random(), 0.3), 0.01, Math.max(Math.random(), 0.3)],
      diffuse: [0.9, 0.9, 0.9]
    }
  })
}

var lights = [
  {
    position: [0, 0, 0],
    styles: {intensity: 5.0, ambient: 1}
  }
]

scene.lights(lights)
scene.shapes(shapes)
scene.init()

var camera = orbit(canvas)

var m = 0.1
var d

function tick () { 
  camera.tick()
  scene.draw(camera)
 
  scene.selectAll('.sphere').each(function (s) {
    d = [Math.random() * m - m/2, Math.random() * m - m/2, Math.random() * m - m/2]
    s.position(function (p) {
      return [p[0] + d[0], p[1] + d[1], p[2] + d[2]]
    })
  })
}
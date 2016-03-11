var context = require('gl-context')
var fit = require('canvas-fit')
var orbit = require('canvas-orbit-camera')
var icosphere = require('icosphere')

var canvas = document.body.appendChild(document.createElement('canvas'))
window.addEventListener('resize', fit(canvas), false)
var gl = context(canvas, tick)

var scene = require('../index.js')(gl, {background: [0, 0, 0]})

var phases = []
var positions = []
for (var i = 0; i < 200; i++) {
  phases[i] = Math.random() * Math.PI * 2
  positions[i] = [Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10]
}

var shapes = []
for (var i = 0; i < 200; i++) {
  shapes.push({
    class: 'sphere',
    complex: icosphere(3),
    position: swirl(positions[i], phases[i], 0),
    style: {
      emissive: [Math.max(Math.random(), 0.3), 0.01, Math.max(Math.random(), 0.3)],
      diffuse: [0.9, 0.9, 0.9]
    }
  })
}

var lights = [
  {
    position: [0, 0, 0],
    style: {intensity: 2.0, ambient: 1, attenuation: 0.01}
  }
]

scene.lights(lights)
scene.shapes(shapes)
scene.init()

var camera = orbit(canvas)

var now

var p
var t = 0

function tick () { 
  scene.draw(camera)
  scene.selectAll('.sphere').each(function (d, i) {
    d.position(swirl(positions[i], phases[i], t))
  })
  t += 0.01
}

function swirl (p, r, t) {
  var dx = Math.sin(t + r)
  var dy = Math.cos(t + r)
  return [p[0] + dx, p[1] + dy, p[2] + dx + dy]
}
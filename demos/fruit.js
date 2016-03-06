var context = require('gl-context')
var fit = require('canvas-fit')
var orbit = require('canvas-orbit-camera')
var icosphere = require('icosphere')
var extrude = require('extrude')

var canvas = document.body.appendChild(document.createElement('canvas'))
window.addEventListener('resize', fit(canvas), false)
var gl = context(canvas, tick)

var scene = require('../index.js')(gl)

var shapes = [
  {
    id: 'floor',
    complex: extrude([[-50, 50], [-50, -50], [50, -50], [50, 50]], {top: 0, bottom: -2}),
    position: [0, 0, 0],
    style: {ambient: [0.4, 0.4, 0.4], diffuse: [0.3, 0.3, 0.3]}
  },
  {
    id: 'apple', class: 'sphere',
    complex: icosphere(4),
    position: [8, 0, 1],
    style: {emissive: [0.8, 0.1, 0.0]}
  },
  {
    id: 'orange', class: 'sphere',
    complex: icosphere(4),
    position: [-5, -5, 2], scale: 2,
    style: {emissive: [1.0, 1.0, 0.0]}
  },
  {
    id: 'pear', class: 'sphere',
    complex: icosphere(4),
    position: [0, 8, 3], scale: 3,
    style: {emissive: [0.0, 0.9, 0.1]}
  }
]

var lights = [
  {
    id: 'point', 
    position: [0, 0, 5, 1],
    style: {color: [1, 1, 1], intensity: 0.0, ambient: 0.0, attenuation: 0.01}
  }, 
  {
    id: 'pear-light', class: 'glow',
    position: [0, 8, 3, 1],
    style: {color: [0.0, 0.9, 0.1]}
  },
  {
    id: 'apple-light', class: 'glow',
    position: [8, 0, 1, 1],
    style: {color: [0.8, 0.1, 0.0]}
  },
  {
    id: 'orange-light', class: 'glow',
    position: [-5, -5, 2, 1],
    style: {color: [0.9, 0.6, 0.0]}
  }
]

var stylesheet = {
  '.dark': {emissive: [0.05, 0.05, 0.05]},
  '.sphere': {diffuse: [0.1, 0.1, 0.1]},
  '.glow': {intensity: 8.0, ambient: 0.0, attenuation: 0.01}
}

scene.shapes(shapes)
scene.lights(lights)
scene.stylesheet(stylesheet)
scene.init()

var camera = orbit(canvas)

function tick () { 
  if ((scene.frame + 5) % 30 == 0) {
    scene.select('#pear').toggleClass('dark')
    scene.select('#pear-light').toggle()
  }
  if ((scene.frame + 15) % 30 == 0) {
    scene.select('#apple').toggleClass('dark')
    scene.select('#apple-light').toggle()
  }
  if ((scene.frame + 25) % 30 == 0) {
    scene.select('#orange').toggleClass('dark')
    scene.select('#orange-light').toggle()
  }
  scene.draw(camera)
}
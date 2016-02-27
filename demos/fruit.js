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
    id: 'floor', className: 'floor',
    complex: extrude([[-50, 50], [-50, -50], [50, -50], [50, 50]], {top: 0, bottom: -2}),
    position: [0, 0, 0]
  },
  {
    id: 'apple', className: 'sphere',
    complex: icosphere(4),
    position: [8, 0, 1]
  },
  {
    id: 'orange', className: 'sphere',
    complex: icosphere(4),
    position: [-5, -5, 2], scale: 2
  },
  {
    id: 'pear', className: 'sphere',
    complex: icosphere(4),
    position: [0, 8, 3], scale: 3
  }
]

var lights = [
  {id: 'point', position: [0, 0, 5, 1]}, 
  {id: 'pear-light', position: [0, 8, 3, 1]},
  {id: 'apple-light', position: [8, 0, 1, 1]},
  {id: 'orange-light', position: [-5, -5, 2, 1]}
]

var styles = {
  '#floor': {ambient: [0.4, 0.4, 0.4], diffuse: [0.3, 0.3, 0.3]},
  '#apple': {emissive: [0.8, 0.1, 0.0], diffuse: [0.1, 0.1, 0.1]},
  '#orange': {emissive: [0.9, 0.6, 0.0], diffuse: [0.1, 0.1, 0.1]},
  '#pear': {emissive: [0.0, 0.9, 0.1], diffuse: [0.1, 0.1, 0.1]},
  '.dark': {emissive: [0.05, 0.05, 0.05]},
  '#point': {color: [1, 1, 1], intensity: 0.0, ambient: 0.0, attenuation: 0.01},
  '#pear-light': {color: [0.0, 0.9, 0.1], intensity: 8.0, ambient: 0.0, attenuation: 0.01},
  '#apple-light': {color: [0.8, 0.1, 0.0], intensity: 8.0, ambient: 0.0, attenuation: 0.01},
  '#orange-light': {color: [0.9, 0.6, 0.0], intensity: 8.0, ambient: 0.0, attenuation: 0.01}
}

scene.shapes(shapes)
scene.lights(lights)
scene.styles(styles)
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

  camera.tick()
  scene.draw(camera)
}
var context = require('gl-context')
var fit = require('canvas-fit')
var orbit = require('canvas-orbit-camera')
var mat4 = require('gl-mat4')
var icosphere = require('icosphere')
var extrude = require('extrude')

var canvas = document.body.appendChild(document.createElement('canvas'))
window.addEventListener('resize', fit(canvas), false)
var gl = context(canvas, tick)

var scene = require('./index.js')(gl, {background: [0.02, 0.02, 0.02]})

var shapes = [
  {
    id: 'sun',
    complex: icosphere(4),
    model: [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1]
  },
  {
    id: 'earth', class: 'planet',
    complex: icosphere(4),
    model: [1.5, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 1.5, 0, 6, 0, 0, 1]
  },
  {
    id: 'mars', class: 'planet',
    complex: icosphere(4),
    model: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 8, 0, 1]
  },
]

var styles = [
  {tag: '#sun', emissive: [0.9, 0.9, 0.0]},
  {tag: '#earth', emissive: [0.0, 0.5, 0.0]},
  {tag: '#mars', emissive: [0.3, 0.0, 0.0]},
  {tag: '.planet', diffuse: [0.1, 0.1, 0.1]}
]

scene.shapes(shapes, styles)

var lights = [
  {id: 'sun', position: [0, 0, 0, 1]}
]
var styles = [
  {tag: '#sun', color: [0.8, 0.8, 0.0], brightness: 20.0, ambient: 0.05, attenuation: 0.01}
]

scene.lights(lights, styles)
scene.init()
scene.draw()

var camera = orbit(canvas)

function tick () { 
  camera.tick()
  scene.update(camera)
  scene.draw()
}
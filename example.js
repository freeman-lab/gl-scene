var context = require('gl-context')
var fit = require('canvas-fit')
var orbit = require('canvas-orbit-camera')
var mat4 = require('gl-mat4')
var icosphere = require('icosphere')
var extrude = require('extrude')

var canvas = document.body.appendChild(document.createElement('canvas'))
window.addEventListener('resize', fit(canvas), false)
var gl = context(canvas, tick)

var scene = require('./index.js')(gl)

var shapes = [
  {
    id: 'floor', class: 'floor',
    complex: extrude([[-50, 50], [-50, -50], [50, -50], [50, 50]], {top: 0, bottom: -2}),
    move: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  },
  {
    id: 'apple', class: 'sphere',
    complex: icosphere(4),
    move: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8, 0, 1, 1]
  },
  {
    id: 'orange', class: 'sphere',
    complex: icosphere(4),
    move: [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, -5, -10, 2, 1]
  },
  {
    id: 'pear', class: 'sphere',
    complex: icosphere(4),
    move: [3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 8, 3, 1]
  }
]

var opts = [
  {tag: '.sphere', material: 'basic'},
  {tag: '#floor', ambient: [0.4, 0.4, 0.4], diffuse: [0.3, 0.3, 0.3]},
  {tag: '#apple', emissive: [0.8, 0.1, 0.0], diffuse: [0.8, 0.1, 0.0]},
  {tag: '#orange', emissive: [0.9, 0.6, 0.0], diffuse: [0.9, 0.6, 0.0]},
  {tag: '#pear', emissive: [0.0, 0.9, 0.1], diffuse: [0.0, 0.9, 0.1]}
]

scene.shapes(shapes, opts)

var lights = [
  {id: 'point', position: [0, 0, 5, 1]}, 
  {id: 'pear', position: [0, 8, 3, 1]},
  {id: 'apple', position: [8, 0, 1, 1]},
  {id: 'orange', position: [-5, -10, 2, 1]}
]
var opts = [
  {tag: '#point', color: [1, 1, 1], brightness: 1.0, ambient: 0.1, attenuation: 0.01},
  {tag: '#pear', color: [0.0, 0.9, 0.1], brightness: 8.0, ambient: 0.0, attenuation: 0.01},
  {tag: '#apple', color: [0.8, 0.1, 0.0], brightness: 8.0, ambient: 0.0, attenuation: 0.01},
  {tag: '#orange', color: [0.9, 0.6, 0.0], brightness: 8.0, ambient: 0.0, attenuation: 0.01},
]

scene.lights(lights, opts)

scene.init()
scene.draw()

var camera = orbit(canvas)

function tick () {
  camera.tick()
  scene.update(camera)
  scene.draw()
}
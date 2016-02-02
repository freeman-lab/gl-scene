var context = require('gl-context')
var fit = require('canvas-fit')
var orbit = require('canvas-orbit-camera')
var mat4 = require('gl-mat4')
var icosphere = require('icosphere')
var extrude = require('extrude')

var canvas = document.body.appendChild(document.createElement('canvas'))
var gl = context(canvas)
fit(canvas)

var scene = require('./index.js')(gl, {
  viewer: [0, -5, 20], 
  background: [0.02, 0.02, 0.02]
})

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
    model: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 6, 0, 1]
  },
  {
    id: 'neptune', class: 'planet',
    complex: icosphere(4),
    model: [1.25, 0, 0, 0, 0, 1.25, 0, 0, 0, 0, 1.25, 0, -4.8, -4.8, 0, 1]
  }
]

var styles = [
  {tag: '#sun', emissive: [0.9, 0.9, 0]},
  {tag: '#earth', ambient: [0.0, 0.4, 0.2]},
  {tag: '#mars', ambient: [0.6, 0.1, 0.1]},
  {tag: '#neptune', ambient: [0.0, 0.2, 0.4]},
  {tag: '.planet', diffuse: [0.9, 0.9, 0.9]}
]

scene.shapes(shapes, styles)
scene.init()
scene.draw()
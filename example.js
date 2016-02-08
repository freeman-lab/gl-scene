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
  viewer: [0, -18, 8], 
  background: [0.02, 0.02, 0.02]
})

var shapes = [
  {
    id: 'floor',
    complex: extrude([[-50, 50], [-50, -50], [50, -50], [50, 50]], {top: 0, bottom: -2}),
    model: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  },
  {
    id: 'apple', className: 'sphere',
    complex: icosphere(4),
    model: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8, 0, 1, 1]
  },
  {
    id: 'orange', className: 'sphere',
    complex: icosphere(4),
    model: [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, -5, -5, 2, 1]
  },
  {
    id: 'pear', className: 'sphere',
    complex: icosphere(4),
    model: [3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 8, 3, 1]
  }
]

var shapeStyles = [
  {tag: '#floor', diffuse: [0.3, 0.3, 0.3]},
  {tag: '#apple', emissive: [0.8, 0.1, 0.0]},
  {tag: '#pear', emissive: [0.0, 0.9, 0.1]},
  {tag: '#orange', emissive: [0.9, 0.6, 0.0]},
  {tag: '.sphere', diffuse: [0.1, 0.1, 0.1]}
]

var lights = [
  {id: 'pear', className: 'glow', position: [0, 8, 3, 1]},
  {id: 'apple', className: 'glow', position: [8, 0, 1, 1]},
  {id: 'orange', className: 'glow', position: [-5, -5, 2, 1]}
]

var lightStyles = [
  {tag: '#pear', color: [0.0, 0.9, 0.1]},
  {tag: '#apple', color: [0.8, 0.1, 0.0]},
  {tag: '#orange', color: [0.9, 0.6, 0.0]},
  {tag: '.glow', brightness: 8.0, ambient: 0.0, attenuation: 0.01}
]

scene.shapes(shapes, shapeStyles)
scene.lights(lights, lightStyles)
scene.init()
scene.draw()

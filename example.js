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
  {id: 'pear-light', className: 'glowing', position: [0, 8, 3, 1]},
  {id: 'apple-light', className: 'glowing', position: [8, 0, 1, 1]},
  {id: 'orange-light', className: 'glowing', position: [-5, -5, 2, 1]}
]

var styles = {
  '#floor': {diffuse: [0.3, 0.3, 0.3]},
  '#apple': {emissive: [0.8, 0.1, 0.0]},
  '#pear': {emissive: [0.0, 0.9, 0.1]},
  '#orange': {emissive: [0.9, 0.6, 0.0]},
  '.sphere': {diffuse: [0.1, 0.1, 0.1]},
  '#pear-light': {color: [0.0, 0.9, 0.1]},
  '#apple-light': {color: [0.8, 0.1, 0.0]},
  '#orange-light': {color: [0.9, 0.6, 0.0]},
  '.glowing': {intensity: 8.0, ambient: 0.0, attenuation: 0.01}
}

scene.shapes(shapes)
scene.lights(lights)
scene.styles(styles)
scene.init()
scene.draw()
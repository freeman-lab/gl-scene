// create webgl context
var context = require('gl-context')
var fit = require('canvas-fit')
var canvas = document.body.appendChild(document.createElement('canvas'))
var gl = context(canvas)
fit(canvas)

// create the scene
var scene = require('./index.js')(gl, {
  observer: [0, -18, 8],
  background: [0.02, 0.02, 0.02]
})

// create shapes
var icosphere = require('icosphere')
var extrude = require('extrude')
var shapes = [
  {
    complex: extrude([[-50, 50], [-50, -50], [50, -50], [50, 50]], {top: 0, bottom: -2}),
    position: [0, 0, 0],
    style: {diffuse: [0.3, 0.3, 0.3]}
  },
  {
    complex: icosphere(4),
    position: [8, 0, 1],
    style: {emissive: [0.8, 0.1, 0.0], diffuse: [0.1, 0.1, 0.1]}
  },
  {
    complex: icosphere(4),
    position: [-5, -5, 2], scale: 2,
    style: {emissive: [1.0, 1.0, 0.0], diffuse: [0.1, 0.1, 0.1]}
  },
  {
    complex: icosphere(4),
    position: [0, 8, 3], scale: 3,
    style: {emissive: [0.0, 0.9, 0.1], diffuse: [0.1, 0.1, 0.1]}
  }
]

// create lights
var lights = [
  {
    position: [0, 8, 3],
    style: {intensity: 8.0, ambient: 0.0, attenuation: 0.01, color: [0.0, 0.9, 0.1]}
  },
  {
    position: [8, 0, 1],
    style: {intensity: 8.0, ambient: 0.0, attenuation: 0.01, color: [0.8, 0.1, 0.0]}
  },
  {
    position: [-5, -5, 2],
    style: {intensity: 8.0, ambient: 0.0, attenuation: 0.01, color: [0.9, 0.6, 0.0]}
  }
]

// render the scene
scene.shapes(shapes)
scene.lights(lights)
scene.init()
scene.draw()

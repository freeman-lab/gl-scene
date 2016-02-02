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
    model: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    material: 'basic'
  },
  {
    id: 'apple', class: 'sphere',
    complex: icosphere(4),
    model: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8, 0, 1, 1],
    material: 'basic'
  },
  {
    id: 'orange', class: 'sphere',
    complex: icosphere(4),
    model: [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, -5, -5, 2, 1],
    material: 'basic'
  },
  {
    id: 'pear', class: 'sphere',
    complex: icosphere(4),
    model: [3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 8, 3, 1],
    material: 'basic'
  }
]

var opts = [
  {tag: '#floor', ambient: [0.4, 0.4, 0.4], diffuse: [0.3, 0.3, 0.3]},
  {tag: '#apple', emissive: [0.8, 0.1, 0.0], diffuse: [0.1, 0.1, 0.1]},
  {tag: '#orange', emissive: [0.9, 0.6, 0.0], diffuse: [0.1, 0.1, 0.1]},
  {tag: '#pear', emissive: [0.0, 0.9, 0.1], diffuse: [0.1, 0.1, 0.1]},
  {tag: '.dark', emissive: [0.05, 0.05, 0.05]}
]

scene.shapes(shapes, opts)

var lights = [
  {id: 'point', position: [0, 0, 5, 1]}, 
  {id: 'pear', position: [0, 8, 3, 1]},
  {id: 'apple', position: [8, 0, 1, 1]},
  {id: 'orange', position: [-5, -5, 2, 1]}
]
var opts = [
  {tag: '#point', color: [1, 1, 1], brightness: 0.0, ambient: 0.0, attenuation: 0.01},
  {tag: '#pear', color: [0.0, 0.9, 0.1], brightness: 8.0, ambient: 0.0, attenuation: 0.01},
  {tag: '#apple', color: [0.8, 0.1, 0.0], brightness: 8.0, ambient: 0.0, attenuation: 0.01},
  {tag: '#orange', color: [0.9, 0.6, 0.0], brightness: 8.0, ambient: 0.0, attenuation: 0.01},
  {tag: '.bright', color: [1.0, 1.0, 1.0], brightness: 8.0}
]

scene.lights(lights, opts)

scene.init()

var camera = orbit(canvas)

function tick () { 

  if ((scene.frame + 5) % 30 == 0) {
    scene.select('#pear').toggleClass('dark')
    scene.select('light #pear').toggle()
  }
  if ((scene.frame + 15) % 30 == 0) {
    scene.select('#apple').toggleClass('dark')
    scene.select('light #apple').toggle()
  }
  if ((scene.frame + 25) % 30 == 0) {
    scene.select('#orange').toggleClass('dark')
    scene.select('light #orange').toggle()
  }
 
  camera.tick()
  scene.update(camera)
  scene.draw()
}
var context = require('gl-context')
var fit = require('canvas-fit')
var orbit = require('canvas-orbit-camera')
var mat4 = require('gl-mat4')
var icosphere = require('icosphere')

var canvas = document.body.appendChild(document.createElement('canvas'))
window.addEventListener('resize', fit(canvas), false)
var gl = context(canvas, tick)

var scene = require('./index.js')(gl)

var shapes = [
  {
    id: 'apple', class: 'sphere',
    complex: icosphere(1),
    move: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 8, 0, 0, 1]
  },
  {
    id: 'orange', class: 'sphere',
    complex: icosphere(1),
    move: [1.5, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 1]
  },
  {
    id: 'pear', class: 'sphere',
    complex: icosphere(1),
    move: [3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 8, 0, 1]
  }
]

var opts = [
  {tag: '.sphere', material: 'flat'},
  {tag: '#apple', color: [0.8, 0.0, 0.0]},
  {tag: '#orange', color: [0.9, 0.6, 0.0]},
  {tag: '#pear', color: [0.1, 0.7, 0.1]}
]

scene.shapes(shapes, opts)
scene.init()
scene.draw()

var camera = orbit(canvas)

function tick () {
  camera.tick()
  scene.update(camera)
  scene.draw()
}
var context = require('gl-context')
var fit = require('canvas-fit')
var orbit = require('canvas-orbit-camera')
var icosphere = require('icosphere')
var extrude = require('extrude')
var control = require('control-panel')

var canvas = document.body.appendChild(document.createElement('canvas'))
window.addEventListener('resize', fit(canvas), false)
var gl = context(canvas, tick)

var scene = require('../index.js')(gl, {background: [0, 0, 0]})

var shapes = [
  {
    id: 'floor',
    complex: extrude([[-50, 50], [-50, -50], [50, -50], [50, 50]], {top: 0, bottom: -2}),
    position: [0, 0, 0],
    style: {ambient: [0.4, 0.4, 0.4], diffuse: [0.3, 0.3, 0.3]}
  },
  {
    id: 'sphere-2', class: 'sphere',
    complex: icosphere(4),
    position: [8, 0, 1]
  },
  {
    id: 'sphere-1', class: 'sphere',
    complex: icosphere(4),
    position: [-5, -5, 2], scale: 2
  },
  {
    id: 'sphere-0', class: 'sphere',
    complex: icosphere(4),
    position: [0, 8, 3], scale: 3
  }
]

var lights = [
  {
    id: 'point',
    position: [0, 0, 5, 1],
    style: {color: [1, 1, 1], intensity: 0.0, ambient: 0.0, attenuation: 0.01}
  },
  {
    id: 'sphere-0-light', class: 'glow',
    position: [0, 8, 3, 1]
  },
  {
    id: 'sphere-2-light', class: 'glow',
    position: [8, 0, 1, 1]
  },
  {
    id: 'sphere-1-light', class: 'glow',
    position: [-5, -5, 2, 1]
  }
]

var stylesheet = {
  '.sphere': {diffuse: [0.1, 0.1, 0.1]},
  '.glow': {intensity: 8.0, ambient: 0.0, attenuation: 0.01}
}

scene.shapes(shapes)
scene.lights(lights)
scene.stylesheet(stylesheet)
scene.init()

var camera = orbit(canvas)

var colors = {
  'sphere-0': [0.8, 0.1, 0.0],
  'sphere-1': [1.0, 1.0, 0.0],
  'sphere-2': [0.0, 0.9, 0.1]
}
var frequency = 30
var keys = Object.keys(colors)

var panel = control([
  {type: 'range', label: 'frequency', min: 5, max: 60, step: 1, initial: frequency},
  {type: 'color', label: 'sphere-0', format: 'array', initial: colors['sphere-0']},
  {type: 'color', label: 'sphere-1', format: 'array', initial: colors['sphere-1']},
  {type: 'color', label: 'sphere-2', format: 'array', initial: colors['sphere-2']}
],
  {position: 'top-right', theme: 'dark', width: 300, title: 'sphere rave'}
)

panel.on('input', function (data) {
  frequency = data.frequency
  keys.forEach(function (sphere) { colors[sphere] = data[sphere] })
})

var phase = 0

function tick () {
  keys.forEach(function (sphere) {
    scene.select('#' + sphere).style('emissive', colors[sphere])
    scene.select('#' + sphere + '-light').style('color', colors[sphere])
  })

  var mod = scene.frame % frequency
  if (mod < Math.floor(frequency * 1/3)) phase = 0
  if (mod >= Math.floor(frequency * 1/3) & mod < Math.floor(frequency * 2/3)) phase = 1
  if (mod > Math.floor(frequency * 2/3)) phase = 2
  
  if (phase === 0) {
    scene.select('#sphere-0').style('emissive', [0.05, 0.05, 0.05])
    scene.select('#sphere-0-light').style('color', [0.05, 0.05, 0.05])
  }

  if (phase === 1) {
    scene.select('#sphere-1').style('emissive', [0.05, 0.05, 0.05])
    scene.select('#sphere-1-light').style('color', [0.05, 0.05, 0.05])
  }

  if (phase === 2) {
    scene.select('#sphere-2').style('emissive', [0.05, 0.05, 0.05])
    scene.select('#sphere-2-light').style('color', [0.05, 0.05, 0.05])
  }

  scene.draw(camera)
}
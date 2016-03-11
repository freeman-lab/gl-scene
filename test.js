var context = require('gl-context')
var test = require('tape')
var allclose = require('test-allclose')
var scene = require('./index')
var icosphere = require('icosphere')

var canvas = document.body.appendChild(document.createElement('canvas'))
var gl = context(canvas)

test('construction', function (t) {
  var scene = require('gl-scene')(gl)
  t.ok(scene, 'scene constructed')
  t.end()
})

test('initialization', function (t) {
  var scene = require('gl-scene')(gl)
  scene.shapes([{complex: icosphere(2)}])
  t.notOk(scene.ready, 'scene uninitialized')
  scene.init()
  t.ok(scene.ready, 'scene initialized')
  t.end()
})

test('construction defaults', function (t) {
  var scene = require('gl-scene')(gl)
  allclose(t)(scene.target, [0, 0, 0])
  allclose(t)(scene.observer, [0, -10, 30])
  t.equals(scene.near, 0.01)
  t.equals(scene.far, 1000)
  t.end()
})

test('construction options', function (t) {
  var scene = require('gl-scene')(gl, {
    background: [0, 0, 0], 
    target: [5, 5, 5],
    observer: [10, 10, 10],
    near: 0,
    far: 100
  })
  allclose(t)(scene.target, [5, 5, 5])
  allclose(t)(scene.observer, [10, 10, 10])
  allclose(t)(scene.background, [0, 0, 0])
  t.equals(scene.near, 0)
  t.equals(scene.far, 100)
  t.end()
})

test('add one shape', function (t) {
  var scene = require('gl-scene')(gl)
  scene.shapes([{complex: icosphere(2)}])
  t.equals(scene._shapes.length, 1)
  t.end()
})

test('add many shapes', function (t) {
  var scene = require('gl-scene')(gl)
  scene.shapes([{complex: icosphere(2)}, {complex: icosphere(2)}])
  t.equals(scene._shapes.length, 2)
  t.end()
})

test('add one light', function (t) {
  var scene = require('gl-scene')(gl)
  scene.lights([{position: [0, 0, 0]}])
  t.equals(scene._lights.length, 1)
  t.end()
})

test('add many light', function (t) {
  var scene = require('gl-scene')(gl)
  scene.lights([{position: [0, 0, 0]}, {position: [0, 0, 0]}])
  t.equals(scene._lights.length, 2)
  t.end()
})

test('add shapes and lights', function (t) {
  var scene = require('gl-scene')(gl)
  scene.shapes([{complex: icosphere(2)}, {complex: icosphere(2)}])
  scene.lights([{position: [0, 0, 0]}, {position: [0, 0, 0]}])
  t.equals(scene._shapes.length, 2)
  t.equals(scene._lights.length, 2)
  t.end()
})

test('custom material', function (t) {
  var scene = require('gl-scene')(gl)
  var normal = require('gl-normal-material')
  scene.shapes([{material: 'normal', complex: icosphere(2)}])
  scene.materials({normal: normal})
  scene.init()
  t.ok(scene._materials.normal, 'material defined')
  t.equal(scene._shapes[0].style.saturation, normal.styles.saturation.default)
  t.equal(scene._shapes[0].style.absolute, normal.styles.absolute.default)
  t.end()
})

test('draw', function (t) {
  var scene = require('gl-scene')(gl)
  scene.shapes([{complex: icosphere(2)}])
  scene.init()
  t.equals(scene.frame, 0)
  scene.draw()
  t.equals(scene.frame, 1)
  t.end()
})

test('default shape selectors', function (t) {
  var scene = require('gl-scene')(gl)
  scene.shapes([{complex: icosphere(2)}])
  t.equals(scene._shapes[0].id, 'shape-0')
  t.equals(scene._shapes[0].className, '')
  t.end()
})

test('default light selectors', function (t) {
  var scene = require('gl-scene')(gl)
  scene.lights([{position: [0, 0, 0]}])
  t.equals(scene._lights[0].id, 'light-0')
  t.equals(scene._lights[0].className, '')
  t.end()
})

test('shape visibility', function (t) {
  var scene = require('gl-scene')(gl)
  scene.shapes([{id: 'shape', complex: icosphere(2)}])
  scene.init()
  t.equals(scene._shapes[0].attributes.visible, true)
  scene.select('#shape').hide()
  t.equals(scene._shapes[0].attributes.visible, false)
  scene.select('#shape').show()
  t.equals(scene._shapes[0].attributes.visible, true)
  scene.select('#shape').toggle()
  t.equals(scene._shapes[0].attributes.visible, false)
  t.end()
})

test('light visibility', function (t) {
  var scene = require('gl-scene')(gl)
  scene.shapes([{id: 'shape', complex: icosphere(2)}])
  scene.lights([{id: 'light', position: [0, 0, 0]}])
  scene.init()
  t.equals(scene._lights[0].attributes.visible, true)
  scene.select('#light').hide()
  t.equals(scene._lights[0].attributes.visible, false)
  scene.select('#light').show()
  t.equals(scene._lights[0].attributes.visible, true)
  scene.select('#light').toggle()
  t.equals(scene._lights[0].attributes.visible, false)
  t.end()
})

test('stylesheet', function (t) {
  var scene = require('gl-scene')(gl)
  scene.shapes([{id: 'shape', complex: icosphere(2), material: 'normal'}])
  scene.stylesheet({'#shape': {saturation: 0.5, absolute: false}})
  scene.init()
  t.deepEquals(scene._shapes[0].style, {saturation: 0.5, absolute: false})
  t.end()
})


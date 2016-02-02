var Shader = require('gl-shader')
var Geometry = require('gl-geometry')
var Shape = require('./components/shape.js')
var Light = require('./components/light.js')
var mat4 = require('gl-mat4')
var mat3 = require('gl-mat3')
var eye = require('eye-vector')
var normals = require('normals')
var glslify = require('glslify')
var distance = require('euclidean-distance')
var _ = require('lodash')

function Scene (gl, opts) {
  if (!(this instanceof Scene)) return new Scene(gl, opts)
  opts = opts || {}
  this.gl = gl
  this.fov = opts.fov || Math.PI / 4
  this.near = opts.near || 0.01
  this.far = opts.far || 1000
  this.target = opts.target || [0, 0, 0]
  this.viewer = opts.viewer || [0, -10, 30]
  this.background = opts.background || [0.0, 0.0, 0.0]
}

Scene.prototype.init = function () {
  var self = this
  if (!self._shapes) throw Error('Cannot initialize without shapes')
  this.frame = 0
  this.proj = mat4.create()
  this.view = mat4.lookAt(mat4.create(), self.viewer, self.target, [0, 1, 0])
  this.eye = new Float32Array(3)
  eye(this.view, this.eye)
  if (!self._materials) self.materials()
  self.defaults()
}

Scene.prototype.defaults = function () {
  var self = this

  var material
  _.forEach(self._shapes, function (shape) {
    material = self._materials[shape.material]
    _.forEach(material.uniforms, function (prop, index) {
      if (!shape.uniforms[prop]) shape.uniforms[prop] = material.defaults[index]
    })
  })
}

Scene.prototype.materials = function (materials) {
  var self = this

	if (!materials) {
		materials = {
			basic: {
	  		shader: Shader(self.gl,
			    glslify('./shaders/basic.vert'),
			    glslify('./shaders/basic.frag')
            .replace(/LIGHTCOUNT/g, self._lights.length)
            .replace(/LIGHTTYPE/g, 'BasicLight')
            .replace(/MATERIALTYPE/g, 'BasicMaterial')
			  ),
			  uniforms: ['emissive', 'ambient', 'specular', 'diffuse', 'shininess', 'roughness'],
        defaults: [[0.0, 0.0, 0.0], [0.2, 0.2, 0.2], [0.0, 0.0, 0.0], [0.8, 0.8, 0.8], 20.0, 0.7]
		  }
		}
	} 

	self._materials = materials
}

Scene.prototype.shapes = function (objects, styles) {
  var self = this

  var shapes = []
  _.forEach(objects, function (object) {
    shapes.push(Shape({
      gl: self.gl,
      id: object.id,
      class: object.class,
      complex: object.complex,
      model: object.model,
      material: object.material,
      styles: styles
    }))
  })

  _.forEach(shapes, function (shape) {
    shape.set()
  })

  self._shapes = shapes
}

Scene.prototype.lights = function (objects, styles) {
  var self = this

  var lights = []
  _.forEach(objects, function (object) {
    lights.push(Light({
      id: object.id,
      class: object.class,
      position: object.position,
      styles: styles
    }))
  })

  _.forEach(lights, function (light) {
    light.set()
  })

  self._lights = lights
}

Scene.prototype.draw = function () {
  var self = this

  self.width = self.gl.drawingBufferWidth
  self.height = self.gl.drawingBufferHeight
  self.gl.viewport(0, 0, self.width, self.height)
  mat4.perspective(self.proj, self.fov, self.width / self.height, self.near, self.far)

  self.gl.clearColor(self.background[0], self.background[1], self.background[2], 1)
  self.gl.clear(self.gl.COLOR_BUFFER_BIT)
  self.gl.enable(self.gl.DEPTH_TEST)

  _.forEach(self._shapes, function (shape) {
    if (shape.enabled) {
      mat3.normalFromMat4(shape.modelT, shape.model)
      mat3.normalFromMat4(shape.animateT, shape.animate)
    	
      shape.shader = self._materials[shape.material]
      shape.geometry.bind(shape.shader.shader)
      shape.shader.shader.uniforms.proj = self.proj
      shape.shader.shader.uniforms.view = self.view
      shape.shader.shader.uniforms.eye = self.eye
      shape.shader.shader.uniforms.lights = self._lights

      shape.shader.shader.uniforms.model = shape.model
      shape.shader.shader.uniforms.modelT = shape.modelT
      shape.shader.shader.uniforms.animate = shape.animate
      shape.shader.shader.uniforms.animateT = shape.animateT
      shape.shader.shader.uniforms.material = shape.uniforms
      
      shape.geometry.draw(self.gl.TRIANGLES)
      shape.geometry.unbind()
    }
  })
}

Scene.prototype.update = function (camera) {
  camera.view(this.view)
  eye(this.view, this.eye)
  this.frame += 1
}

Scene.prototype.select = function (selector) {
  var self = this
  if (selector.split(' ').length == 1) selector = 'shape ' + selector
  var parts = selector.split(' ')
  var type = parts[0]
  var label = parts[1]
  var targets
  if (type === 'shape') targets = self._shapes
  if (type === 'light') targets = self._lights
  if (!(label.startsWith('#') || label.startsWith('.'))) label = '#' + label
  if (label.startsWith('#')) return _.find(targets, ['id', label.replace('#', '')])
  if (label.startsWith('.')) return _.find(targets, ['class', label.replace('.', '')])
}

module.exports = Scene
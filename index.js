var Shader = require('gl-shader')
var Geometry = require('gl-geometry')
var mat4 = require('gl-mat4')
var eye = require('eye-vector')
var normals = require('normals')
var glslify = require('glslify')
var distance = require('euclidean-distance')
var _ = require('lodash')

function Scene (gl, opts) {
  if (!(this instanceof Scene)) return new Scene(gl)
  opts = opts || {}
  this.gl = gl
  this.fov = opts.fov || Math.PI / 4
  this.near = opts.near || 0.01
  this.far = opts.far || 1000
  this.target = opts.target || [0, 0, 0]
  this.viewer = opts.viewer || [0, -10, 30]
}

Scene.prototype.init = function () {
  var self = this
  if (!self._shapes) throw Error('Cannot initialize without shapes')
  this.frame = 0
  this.proj = mat4.create()
  this.view = mat4.lookAt(mat4.create(), self.viewer, self.target, [0, 1, 0])
  this.eye = new Float32Array(3)
  if (!self._shaders) self.shaders()
  self.defaults()
}

Scene.prototype.defaults = function () {
  var self = this

  _.forEach(self._shapes, function (shape) {
    if (!shape.material) shape.material = 'flat'
  })

  var shader
  _.forEach(self._shapes, function (shape) {
    shader = self._shaders[shape.material]
    console.log(shader.uniforms)
    _.forEach(shader.uniforms, function (prop, index) {
      if (!shape[prop]) shape[prop] = shader.defaults[index]
    })
  })
}

Scene.prototype.shaders = function (shaders) {
  var self = this

	if (!shaders) {
		shaders = {
			flat: {
	  		shader: Shader(self.gl,
			    glslify('./shaders/flat.vert'),
			    glslify('./shaders/flat.frag')
			  ),
			  uniforms: ['color', 'fog', 'lit'],
        defaults: [[0.6, 0.6, 0.6], true, true]
		  }
		}
	} 

	self._shaders = shaders
}

Scene.prototype.shapes = function (objects, opts) {
  var self = this

  var attr
  _.forEach(objects, function (object) {
    attr = _.find(opts, ['tag', '#' + object.id])
    if (attr) _.assign(object, attr)
    attr = _.find(opts, ['tag', '.' + object.class])
  	if (attr) _.assign(object, attr)
  })

  var complex
  _.forEach(objects, function (object) {
    complex = object.complex
    object.geometry = Geometry(self.gl)
    object.geometry.attr('position', complex.positions)
    object.geometry.attr('normal', normals.vertexNormals(complex.cells, complex.positions))
    object.geometry.faces(complex.cells)
    object.animate = mat4.create()
    object.render = true
  })

  self._shapes = objects
}

Scene.prototype.draw = function () {
  var self = this

  self.width = self.gl.drawingBufferWidth
  self.height = self.gl.drawingBufferHeight
  self.gl.viewport(0, 0, self.width, self.height)
  mat4.perspective(self.proj, self.fov, self.width / self.height, self.near, self.far)

  self.gl.enable(self.gl.DEPTH_TEST)

  _.forEach(self._shapes, function (shape) {
    if (shape.render) {
    	shape.shader = self._shaders[shape.material]
      shape.geometry.bind(shape.shader.shader)
      shape.shader.shader.uniforms.proj = self.proj
      shape.shader.shader.uniforms.view = self.view
      shape.shader.shader.uniforms.eye = self.eye
      shape.shader.shader.uniforms.move = shape.move
      shape.shader.shader.uniforms.animate = shape.animate
      _.forEach(shape.shader.uniforms, function (prop) {
        shape.shader.shader.uniforms[prop] = shape[prop]
      })
      shape.geometry.draw(self.gl.TRIANGLES)
      shape.geometry.unbind()
    }
  })
}

Scene.prototype.update = function (camera) {
  var self = this
  camera.view(self.view)
  eye(self.view, self.eye)
  this.frame += 1
}

Scene.prototype.hide = function (tag) {
  var self = this
  _.forEach(self.find(tag), function (shape) {
    shape.render = false
  })
}

Scene.prototype.show = function (tag) {
  var self = this
  _.forEach(self.find(tag), function (shape) {
    shape.render = true
  })
}

Scene.prototype.find = function (tag) {
  var self = this
  if (!(tag.startsWith('#') || tag.startsWith('.'))) tag = '#' + tag
  if (tag.startsWith('#')) return [_.find(self._shapes, ['id', tag.replace('#', '')])]
  if (tag.startsWith('.')) return _.filter(self._shapes, ['class', tag.replace('.', '')])
}

module.exports = Scene
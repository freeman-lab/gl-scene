var Shader = require('gl-shader')
var Geometry = require('gl-geometry')
var mat4 = require('gl-mat4')
var mat3 = require('gl-mat3')
var eye = require('eye-vector')
var normals = require('normals')
var glslify = require('glslify')
var distance = require('euclidean-distance')
var reindex = require('mesh-reindex')
var unindex = require('unindex-mesh')
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
  this.view = mat4.lookAt(mat4.create(), self.viewer, self.target, [0, 0, 1])
  this.eye = new Float32Array(3)
  eye(this.view, this.eye)
  if (!self._materials) self.materials()
  self.defaults()
}

Scene.prototype.defaults = function () {
  var self = this

  _.forEach(self._shapes, function (shape) {
    if (!shape.material) shape.material = 'basic'
  })

  var material
  _.forEach(self._shapes, function (shape) {
    material = self._materials[shape.material]
    _.forEach(material.uniforms, function (prop, index) {
      if (shape[prop]) shape._material[prop] = shape[prop]
      if (!shape[prop]) shape._material[prop] = material.defaults[index]
    })
  })

  _.forEach(self._lights, function (light) {
    _.defaults(light, {
      color: [1.0, 1.0, 1.0],
      brightness: 1,
      attenuation: 0.5,
      ambient: 1,
      cutoff: 180,
      target: [0, 0, -1],
      exponent: 0.0
    })
  })
}

Scene.prototype.materials = function (materials) {
  var self = this

  console.log(glslify('./shaders/basic.frag'))

	if (!materials) {
		materials = {
			basic: {
	  		shader: Shader(self.gl,
			    glslify('./shaders/basic.vert'),
			    glslify('./shaders/basic.frag').replace(/LIGHTTYPE/g, 'Light').replace(/MATERIALTYPE/g, 'Material')
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

  var attr
  _.forEach(objects, function (object) {
    attr = _.find(styles, ['tag', '#' + object.id])
    if (attr) _.assign(object, attr)
    attr = _.find(styles, ['tag', '.' + object.class])
  	if (attr) _.assign(object, attr)
  })

  var complex
  _.forEach(objects, function (object) {
    if (!object.complex) throw Error('No simplicial complex specified for shape ' + object.id)
    if (!object.move) throw Error('No move matrix specified for shape ' + object.id)
    complex = object.complex
    complex = reindex(unindex(complex.positions, complex.cells))
    object.geometry = Geometry(self.gl)
    object.geometry.attr('position', complex.positions)
    object.geometry.attr('normal', normals.vertexNormals(complex.cells, complex.positions))
    object.geometry.faces(complex.cells)
    object.animate = mat4.create()
    object.moveT = mat3.create()
    object.animateT = mat3.create()
    object.render = true
    object._material = {}
  })

  self._shapes = objects
}

Scene.prototype.lights = function (objects, styles) {
  var self = this

  var attr
  _.forEach(objects, function (object) {
    attr = _.find(styles, ['tag', '#' + object.id])
    if (attr) _.assign(object, attr)
    attr = _.find(styles, ['tag', '.' + object.class])
    if (attr) _.assign(object, attr)
  })

  _.forEach(objects, function (object) {
    if (!object.position) throw Error('No position vector specified for light ' + object.id)
    object.enabled = true
  })

  self._lights = objects
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
    if (shape.render) {
      mat3.normalFromMat4(shape.moveT, shape.move)
      mat3.normalFromMat4(shape.animateT, shape.animate)
    	
      shape.shader = self._materials[shape.material]
      shape.geometry.bind(shape.shader.shader)
      shape.shader.shader.uniforms.proj = self.proj
      shape.shader.shader.uniforms.view = self.view
      shape.shader.shader.uniforms.eye = self.eye
      shape.shader.shader.uniforms.background = self.background
      shape.shader.shader.uniforms.lights = self._lights

      shape.shader.shader.uniforms.move = shape.move
      shape.shader.shader.uniforms.moveT = shape.moveT
      shape.shader.shader.uniforms.animate = shape.animate
      shape.shader.shader.uniforms.animateT = shape.animateT
      shape.shader.shader.uniforms.material = shape._material
      
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
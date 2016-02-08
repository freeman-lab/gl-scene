var Shader = require('gl-shader')
var Shape = require('./components/shape.js')
var Light = require('./components/light.js')
var elements = require('./components/elements.js')
var mat4 = require('gl-mat4')
var mat3 = require('gl-mat3')
var eye = require('eye-vector')
var normals = require('normals')
var glslify = require('glslify')
var distance = require('euclidean-distance')
var inherits = require('inherits')
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
  this.lighting = {}
  if (!self._lights) self.lights()
  if (!self._materials) self.materials()
  self._setDefaults()
  this.ready = true
}

Scene.prototype._setDefaults = function () {
  var self = this

  self._shapes.each(function (d) {
    _.defaults(d.style, self._materials[d.attributes.material].defaults)
  })

  self._lights.each(function (d) {
    _.defaults(d.style, {
      color: [1.0, 1.0, 1.0],
      attenuation: 0.05,
      brightness: 3.0,
      ambient: 1.0,
      cutoff: 180,
      target: [0, 0, -1],
      exponent: 0.0
    })
  })
}

Scene.prototype._reset = function () {
  this.ready = false
  delete this._materials
}

Scene.prototype.materials = function (materials) {
  var self = this

	if (!materials) {
		materials = {
			basic: {
	  		shader: Shader(self.gl,
			    glslify('./shaders/basic.vert'),
			    glslify('./shaders/basic.frag').replace(/LIGHTCOUNT/g, self._lights.length)
			  ),
        defaults: {
          emissive: [0.0, 0.0, 0.0], 
          ambient: [0.2, 0.2, 0.2], 
          specular: [0.0, 0.0, 0.0], 
          diffuse: [0.8, 0.8, 0.8], 
          shininess: 20.0,
          roughness: 0.7
        }
		  }
		}
	} 

	self._materials = materials
}

Scene.prototype.shapes = function (objects, styles) {
  var self = this
  styles = styles || {}
  self._reset()

  Shape.prototype.styles = styles

  var shapes = []
  _.forEach(objects, function (object) {
    shapes.push(Shape({
      gl: self.gl,
      id: object.id,
      className: object.className,
      complex: object.complex,
      model: object.model,
      material: object.material
    }))
  })

  shapes = elements(shapes)
  shapes.each(function (d) {d.update()})

  self._shapes = shapes
}

Scene.prototype.lights = function (objects, styles) {
  var self = this
  styles = styles || {}
  self._reset()

  if (!objects) {
    objects = [
      {id: 'center', position: [0, 0, 5, 1]}
    ]
  }

  Light.prototype.styles = styles

  var lights = []
  _.forEach(objects, function (object) {
    lights.push(Light({
      id: object.id,
      className: object.className,
      position: object.position
    }))
  })

  lights = elements(lights)
  lights.each(function (d) {d.update()})

  self._lights = lights
}

Scene.prototype.draw = function () {
  var self = this
  if (!self.ready) throw Error('Scene must be initialized before drawing!')

  self.width = self.gl.drawingBufferWidth
  self.height = self.gl.drawingBufferHeight
  self.gl.viewport(0, 0, self.width, self.height)
  mat4.perspective(self.proj, self.fov, self.width / self.height, self.near, self.far)

  self.gl.enable(self.gl.DEPTH_TEST)
  self.gl.clearColor(self.background[0], self.background[1], self.background[2], 1)
  self.gl.clear(self.gl.COLOR_BUFFER_BIT | self.gl.DEPTH_BUFFER_BIT)
  
  self.lighting = _.map(self._lights, 'style')
  _.merge(self.lighting, _.map(self._lights, 'attributes'))

  _.forEach(self._shapes, function (shape) {
    if (shape.attributes.enabled) {
      mat3.normalFromMat4(shape.attributes.model_ti, shape.attributes.model)
      mat3.normalFromMat4(shape.attributes.animate_ti, shape.attributes.animate)
    	
      shape.shader = self._materials[shape.attributes.material]
      shape.attributes.geometry.bind(shape.shader.shader)
      shape.shader.shader.uniforms.proj = self.proj
      shape.shader.shader.uniforms.view = self.view
      shape.shader.shader.uniforms.eye = self.eye
      shape.shader.shader.uniforms.lights = self.lighting

      shape.shader.shader.uniforms.model = shape.attributes.model
      shape.shader.shader.uniforms.model_ti = shape.attributes.model_ti
      shape.shader.shader.uniforms.animate = shape.attributes.animate
      shape.shader.shader.uniforms.animate_ti = shape.attributes.animate_ti
      shape.shader.shader.uniforms.material = shape.style

      shape.attributes.geometry.draw(self.gl.TRIANGLES)
      shape.attributes.geometry.unbind()
    }
  })

  this.frame += 1
}

Scene.prototype.update = function (camera) {
  camera.view(this.view)
  eye(this.view, this.eye)
}

Scene.prototype._selector = function (selector) {
  var type
  var parts = selector.split(' ')
  if (parts.length < 2) {
    type = 'shape'
    selector = parts[0]
  } else {
    type = parts[0]
    selector = parts.slice(1, parts.length).join(' ')
  }
  return {type: type, selector: selector}
}

Scene.prototype.selectAll = function (selector) {
  var parsed = this._selector(selector)
  if (parsed.type === 'shape') return this._shapes.selectAll(parsed.selector)
  if (parsed.type === 'light') return this._shapes.selectAll(parsed.selector)
}

Scene.prototype.select = function (selector) {
  var parsed = this._selector(selector)
  if (parsed.type === 'shape') return this._shapes.select(parsed.selector)
  if (parsed.type === 'light') return this._lights.select(parsed.selector)
}

module.exports = Scene
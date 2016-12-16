var Material = require('gl-material')
var Shape = require('gl-shape')
var Light = require('gl-light')
var mat4 = require('gl-mat4')
var eye = require('eye-vector')
var assign = require('object-assign')
var inherits = require('inherits')
var selectify = require('selectify')
var _ = require('lodash')

module.exports = Scene

function Scene (gl, opts) {
  if (!(this instanceof Scene)) return new Scene(gl, opts)
  if (!gl) throw Error('Must provide a webgl context')
  opts = opts || {}
  this.gl = gl
  this.fov = _.isNumber(opts.fov) ? opts.fov : Math.PI / 4
  this.near = _.isNumber(opts.near) ? opts.near : 0.01
  this.far = _.isNumber(opts.far) ? opts.far : 1000
  this.target = opts.target || [0, 0, 0]
  this.observer = opts.observer || [0, -10, 30]
  this.background = opts.background
}

Scene.prototype.init = function () {
  var self = this
  if (!self._shapes) throw Error('Cannot initialize without shapes')
  this.frame = 0
  this.projection = mat4.create()
  this.view = mat4.lookAt(mat4.create(), self.observer, self.target, [0, 1, 0])
  this.eye = new Float32Array(3)
  eye(this.view, this.eye)
  this.lighting = {}
  if (!self._lights) self.lights()
  if (!self._materials) self.materials()
  if (!self._stylesheet) self.stylesheet()
  self._setDefaults()
  if (self._shapes) {
    self._shapes.each(function (d) { d.stylesheet(self._stylesheet) })
    self._shapes.each(function (d) { d.update() })
  }
  if (self._lights) {
    self._lights.each(function (d) { d.stylesheet(self._stylesheet) })
    self._lights.each(function (d) { d.update() })
  }
  this.ready = true
}

Scene.prototype._setDefaults = function () {
  var self = this

  self._shapes.each(function (d) {
    if (!self._materials[d.attributes.material]) throw Error('Cannot find material: ' + d.attributes.material)
    _.defaults(d.style, self._materials[d.attributes.material].defaults)
  })

  self._lights.each(function (d) {
    _.defaults(d.style, {
      color: [1.0, 1.0, 1.0],
      radius: 30.0,
      intensity: 3.0,
      ambient: 1.0
    })
  })
}

Scene.prototype._reset = function () {
  this.ready = false
  delete this._materials
}

Scene.prototype.stylesheet = function (stylesheet) {
  var self = this
  self._stylesheet = _.extend(self._stylesheet || {}, stylesheet || {})
}

Scene.prototype.materials = function (objects) {
  var self = this

  if (!objects) {
    objects = {
      lambert: require('gl-lambert-material'),
      normal: require('gl-normal-material')
    }
  }

  var materials = {}
  var constants = {}
  _.forEach(objects, function (object, key) {
    if (self._lights) constants = {LIGHTCOUNT: self._lights.length}
    materials[key] = Material(self.gl, object, constants)
  })

  self._materials = materials
}

Scene.prototype.shapes = function (objects) {
  var self = this
  self._reset()

  var stylesheet = {}
  var shapes = []
  var shape, material, id, className
  _.forEach(objects, function (object, index) {
    id = object.id || 'shape-' + index
    className = object.className || object.class || ''
    material = object.material || 'lambert'
    shape = Shape(self.gl, object)
    shapes.push(SceneElement(shape, {id: id, className: className, type: 'shape'}, {visible: true, material: material}))
    if (object.style) stylesheet['#' + id] = object.style
  })

  self.stylesheet(stylesheet)
  self._shapes = SceneCollection(shapes)
}

Scene.prototype.lights = function (objects) {
  var self = this
  self._reset()

  if (!objects) {
    objects = [
      {id: 'center', position: [0, 0, 5, 1]}
    ]
  }

  var stylesheet = {}
  var lights = []
  var light, id, className
  _.forEach(objects, function (object, index) {
    id = object.id || 'light-' + index
    className = object.className || object.class || ''
    light = Light(object)
    lights.push(SceneElement(light, {id: id, className: className, type: 'light'}, {visible: true}))
    if (object.style) stylesheet['#' + id] = object.style
  })

  self.stylesheet(stylesheet)
  self._lights = SceneCollection(lights)
}

Scene.prototype.draw = function (camera) {
  var self = this
  if (!self.ready) throw Error('Scene must be initialized before drawing!')

  if (camera) {
    if (camera.tick) camera.tick()
    camera.view(self.view)
    eye(self.view, self.eye)
  }

  self.width = self.gl.drawingBufferWidth
  self.height = self.gl.drawingBufferHeight
  self.gl.viewport(0, 0, self.width, self.height)
  mat4.perspective(self.projection, self.fov, self.width / self.height, self.near, self.far)

  self.gl.enable(self.gl.DEPTH_TEST)
  if (self.background) {
    self.gl.clearColor(self.background[0], self.background[1], self.background[2], self.background[3] === undefined ? 1 : self.background[3])
    self.gl.clear(self.gl.COLOR_BUFFER_BIT | self.gl.DEPTH_BUFFER_BIT)
  }

  self.lighting = _.map(self._lights, 'style')
  _.merge(self.lighting, _.map(self._lights, 'attributes'))

  _.forEach(self._shapes, function (shape) {
    if (shape.attributes.visible) {
      shape.shader = self._materials[shape.attributes.material]
      shape.attributes.geometry.bind(shape.shader.shader)
      shape.shader.shader.uniforms.projection = self.projection
      shape.shader.shader.uniforms.view = self.view
      shape.shader.shader.uniforms.eye = self.eye
      shape.shader.shader.uniforms.lighting = self.lighting

      shape.shader.shader.uniforms.model = shape.attributes.model
      shape.shader.shader.uniforms.modelNormal = shape.attributes.modelNormal
      shape.shader.shader.uniforms.style = shape.style

      shape.attributes.geometry.draw(self.gl.TRIANGLES)
      shape.attributes.geometry.unbind()
    }
  })

  this.frame += 1
}

Scene.prototype.selectAll = function (selector) {
  if (!this._shapes && !this._lights) throw Error('No shapes or lights to select')
  if (this._shapes) var selection = this._shapes.selectAll(selector)
  if (!selection) selection = this._lights.selectAll(selector)
  if (!selection) throw Error('No matching items for: ' + selector)
  return selection
}

Scene.prototype.select = function (selector) {
  if (!this._shapes && !this._lights) throw Error('No shapes or lights to select')
  if (this._shapes) var selection = this._shapes.select(selector)
  if (!selection) selection = this._lights.select(selector)
  if (!selection) throw Error('No matching items for: ' + selector)
  return selection
}

function SceneElement (item, tags, attributes) {
  if (!(this instanceof SceneElement)) return new SceneElement(item, tags, attributes)
  var self = this

  var style

  self.update = function () {
    style = self._stylesheet['#' + self.id]
    if (style) assign(self.style, style)
    self.className.split(' ').forEach(function (name) {
      style = self._stylesheet['.' + name]
      if (style) assign(self.style, style)
    })
  }

  self.stylesheet = function (stylesheet) {
    self._stylesheet = stylesheet
  }

  self.type = tags.type
  self.id = tags.id
  self.className = tags.className

  self.style = {}
  self.attributes = _.assign({}, attributes, item.attributes)
  _.forEach(item, function (value, key) {
    if (_.isFunction(value)) self[key] = item[key]
  })
}

inherits(SceneCollection, selectify)

function SceneCollection (elements) {
  if (!(this instanceof SceneCollection)) return new SceneCollection(elements)
  SceneCollection.super_.call(this, elements)
}

assign(SceneCollection.prototype, {
  show: function () {
    return this.each(function (d) {
      d.attributes.visible = true
    })
  },

  hide: function () {
    return this.each(function (d) {
      d.attributes.visible = false
    })
  },

  toggle: function () {
    return this.each(function (d) {
      d.attributes.visible ? d.attributes.visible = false : d.attributes.visible = true
    })
  },

  position: function (value) {
    return this.each(function (d) {
      d.position(value)
    })
  },

  scale: function (value) {
    return this.each(function (d) {
      d.scale(value)
    })
  },

  rotation: function (value, axis) {
    return this.each(function (d) {
      d.rotation(value, axis)
    })
  }
})

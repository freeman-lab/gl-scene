var Geometry = require('gl-geometry')
var normals = require('normals')
var reindex = require('mesh-reindex')
var unindex = require('unindex-mesh')
var mat4 = require('gl-mat4')
var mat3 = require('gl-mat3')
var inherits = require('inherits')
var Element = require('./element.js')
var _ = require('lodash')

module.exports = Shape
inherits(Shape, Element)

function Shape (opts) {
  if (!(this instanceof Shape)) return new Shape(opts)
  opts = opts || {}
  if (!opts.complex) throw Error ("Must provide a complex")
  if (!opts.model) throw Error ("Must provide a model matrix")
  if (!opts.gl) throw Error ("Must provide a gl context")
  if (!opts.id) throw Error ("Must provide an id")

  var self = this
  self.id = opts.id
  self.class = opts.class || ''
  self.styles = opts.styles || {}
  self.complex = opts.complex
  self.complex = reindex(unindex(self.complex.positions, self.complex.cells))
  self.geometry = Geometry(opts.gl)
  self.geometry.attr('position', self.complex.positions)
  self.geometry.attr('normal', normals.vertexNormals(self.complex.cells, self.complex.positions))
  self.geometry.faces(self.complex.cells)
  self.model = opts.model
  self.material = opts.material || 'basic'
  self.animate = mat4.create()
  self.modelT = mat3.create()
  self.animateT = mat3.create()
  self.enabled = true
  self.uniforms = {}
}

Shape.prototype.move = function (op) {
  var self = this
  op(self.model)
}

Shape.prototype.style = function (spec) {
  var self = this
  _.forEach(_.keys(spec), function (key) {
    self.uniforms[key] = spec[key]
  })
}

Shape.prototype.set = function () {
  var self = this
  attr = _.find(self.styles, ['tag', '#' + self.id])
  if (attr) _.assign(self.uniforms, _.omit(attr, 'tag'))
  attr = _.find(self.styles, ['tag', '.' + self.class])
  if (attr) _.assign(self.uniforms, _.omit(attr, 'tag'))
}
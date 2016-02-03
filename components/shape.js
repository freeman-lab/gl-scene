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
  if (!opts.complex) throw Error ("Must provide a simplicial complex")
  if (!opts.model) throw Error ("Must provide a model matrix")
  if (!opts.gl) throw Error ("Must provide a weblgl context")
  if (!opts.id) throw Error ("Must provide an id")
  var self = this
  self.id = opts.id
  self.class = opts.class || ''
  self.material = opts.material || 'basic'
  self.attributes = {
    geometry: self.build(opts.gl, opts.complex),
    model: opts.model,
    animate: mat4.create(),
    enabled: true,
    model_ti: mat3.create(),
    animate_ti: mat3.create(),
  }
  self.uniforms = {}
}

Shape.prototype.build = function (gl, complex) {
  var geometry = Geometry(gl)
  var flattened = reindex(unindex(complex.positions, complex.cells))
  geometry.attr('position', flattened.positions)
  geometry.attr('normal', normals.vertexNormals(flattened.cells, flattened.positions))
  geometry.faces(flattened.cells)
  return geometry
}

Shape.prototype.move = function (op) {
  var self = this
  op(self.attributes.model)
}
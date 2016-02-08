var Geometry = require('gl-geometry')
var mat4 = require('gl-mat4')
var mat3 = require('gl-mat3')
var normals = require('normals')
var reindex = require('mesh-reindex')
var unindex = require('unindex-mesh')
var _ = require('lodash')

module.exports = Shape

function Shape (opts) {
  if (!(this instanceof Shape)) return new Shape(opts)
  opts = opts || {}
  if (!opts.complex) throw Error ("Must provide a simplicial complex")
  if (!opts.model) throw Error ("Must provide a model matrix")
  if (!opts.gl) throw Error ("Must provide a weblgl context")
  if (!opts.id) throw Error ("Must provide an id")
  var self = this

  self.build = function (gl, complex) {
    var geometry = Geometry(gl)
    var flattened = reindex(unindex(complex.positions, complex.cells))
    geometry.attr('position', flattened.positions)
    geometry.attr('normal', normals.vertexNormals(flattened.cells, flattened.positions))
    geometry.faces(flattened.cells)
    return geometry
  }

  self.update = function () {
    style = _.find(self.styles, ['tag', '#' + self.id])
    if (style) _.assign(self.style, _.omit(style, 'tag'))
    style = _.find(self.styles, ['tag', '.' + self.className])
    if (style) _.assign(self.style, _.omit(style, 'tag'))
  }

  self.id = opts.id
  self.className = opts.className || ''
  self.style = {}
  self.attributes = {
    material: opts.material || 'basic',
    geometry: self.build(opts.gl, opts.complex),
    model: opts.model,
    animate: mat4.create(),
    enabled: true,
    model_ti: mat3.create(),
    animate_ti: mat3.create(),
  }
}
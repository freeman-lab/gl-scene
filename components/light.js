var inherits = require('inherits')
var Element = require('./element.js')

module.exports = Light
inherits(Light, Element)

function Light (opts) {
  if (!(this instanceof Light)) return new Light(opts)
  opts = opts || {}
  if (!opts.position) throw Error ("Must provide a position")
  if (!opts.id) throw Error ("Must provide an id")
  var self = this
  self.id = opts.id
  self.class = opts.class || ''
  self.attributes = {
    position: opts.position,
    enabled: true
  }
  self.uniforms = {}
}

Light.prototype.move = function (op) {
  var self = this
  op(self.attributes.position)
}

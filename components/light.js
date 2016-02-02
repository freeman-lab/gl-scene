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
  self.styles = opts.styles || {}
  self.position = opts.position
  self.enabled = true

  self.color = opts.color || [1.0, 1.0, 1.0],
  self.brightness = opts.brightness || 1,
  self.attenuation = opts.attenuation || 0.5,
  self.ambient = opts.ambient || 1,
  self.cutoff = opts.cutoff || 180,
  self.target = opts.target || [0, 0, -1],
  self.exponent = opts.exponent || 0.0
}

Light.prototype.move = function (op) {
  var self = this
  op(self.position)
}

Light.prototype.style = function (spec) {
  var self = this
  _.forEach(_.keys(spec), function (key) {
    self[key] = spec[key]
  })
}

Light.prototype.set = function () {
  var self = this
  attr = _.find(self.styles, ['tag', '#' + self.id])
  if (attr) _.assign(self, _.omit(attr, 'tag'))
  attr = _.find(self.styles, ['tag', '.' + self.class])
  if (attr) _.assign(self, _.omit(attr, 'tag'))
}

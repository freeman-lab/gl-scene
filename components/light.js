var _ = require('lodash')

module.exports = Light

function Light (opts) {
  if (!(this instanceof Light)) return new Light(opts)
  opts = opts || {}
  if (!opts.position) throw Error ("Must provide a position")
  if (!opts.id) throw Error ("Must provide an id")
  var self = this
  self.id = opts.id
  self.className = opts.className || ''
  self.style = {}
  self.attributes = {
    position: opts.position,
    enabled: true
  }

  self.update = function () {
    style = _.find(self.styles, ['tag', '#' + self.id])
    if (style) _.assign(self.style, _.omit(style, 'tag'))
    style = _.find(self.styles, ['tag', '.' + self.className])
    if (style) _.assign(self.style, _.omit(style, 'tag'))
  }
}
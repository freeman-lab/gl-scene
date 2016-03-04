var _ = require('lodash')

module.exports = Light

function Light (data) {
  if (!(this instanceof Light)) return new Light(data)
  if (!data.position) throw Error ("Must provide a position")
  if (!data.id) throw Error ("Must provide an id")
  var self = this

  self.update = function () {
    style = self.stylesheet['#' + self.id]
    if (style) _.assign(self.style, style)
    self.className.split(' ').forEach(function (name) {
      style = self.stylesheet['.' + name]
      if (style) _.assign(self.style, style)
    })
  }

  var position = data.position
  if (position.length < 3) throw Error ("Position must have 3 or 4 elements")
  if (position.length === 3) position = position.concat([1])

  self.position = function (value) {
    self.attributes.position[0] = value[0]
    self.attributes.position[1] = value[1]
    self.attributes.position[2] = value[2]
    if (value[3]) self.attributes.position[3] = value[3]
  }

  self.id = data.id
  self.className = data.class || data.className || ''
  self.style = {}
  self.attributes = {
    position: position,
    visible: true
  }
}
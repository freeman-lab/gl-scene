var assign = require('object-assign')

module.exports = element

function element (item, opts) {
  if (!(this instanceof element)) return new element(item, opts)
  var self = this
  
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

  self.type = opts.type
  self.id = opts.id
  self.className = opts.class || opts.className || ''

  self.style = {}
  self.attributes = item.attributes
  self.position = item.position
  self.scale = item.scale
  self.rotation = item.rotation
}
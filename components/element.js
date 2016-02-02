module.exports = Element

function Element () {}

Element.prototype.toggle = function () {
  if (this.attributes.enabled) {
    this.attributes.enabled = false
  } else {
    this.attributes.enabled = true
  }
}

Element.prototype.hide = function () {
  this.attributes.enabled = false
}

Element.prototype.show = function () {
  this.attributes.enabled = true
}

Element.prototype.classed = function (name, value) {
  if (value) this.class = name
  if (!value) this.class = ''
  this.setStyles()
}

Element.prototype.toggleClass = function (name) {
  if (this.class === name) {
    this.class = ''
  } else {
    this.class = name
  }
  this.setStyles()
}

Element.prototype.style = function (spec) {
  var self = this
  _.forEach(_.keys(spec), function (key) {
    self.uniforms[key] = spec[key]
  })
}

Element.prototype.setStyles = function () {
  var self = this
  style = _.find(self.styles, ['tag', '#' + self.id])
  if (style) _.assign(self.uniforms, _.omit(style, 'tag'))
  style = _.find(self.styles, ['tag', '.' + self.class])
  if (style) _.assign(self.uniforms, _.omit(style, 'tag'))
}

Element.prototype.setDefaults = function (defaults) {
  var self = this
  _.forEach(defaults, function (value, key) {
    if (_.isUndefined(self.uniforms[key])) self.uniforms[key] = value
  })
}
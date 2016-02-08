var Selectify = require('selectify')
var inherits = require('inherits')

module.exports = Elements
inherits(Elements, Selectify)

function Elements (items) {
  if (!(this instanceof Elements)) return new Elements(items)
  Elements.super_.call(this, items)
}

Elements.prototype.show = function () {
  return this.each(function (d) {
    d.attributes.enabled = true
  })
}

Elements.prototype.hide = function () {
  return this.each(function (d) {
    d.attributes.enabled = false
  })
}

Elements.prototype.toggle = function () {
  return this.each(function (d) {
    d.attributes.enabled ? d.attributes.enabled = false : d.attributes.enabled = true
  })
}

Elements.prototype.move = function (cb) {
  return this.each(function (d) {
    if (d.attributes.position) cb(d.attributes.position)
    else if (d.attributes.model) cb(d.attributes.model)
  })
}
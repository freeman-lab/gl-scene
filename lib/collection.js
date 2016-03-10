var inherits = require('inherits')
var selectify = require('selectify')
var assign = require('object-assign')

inherits(collection, selectify)
module.exports = collection

function collection (elements) {
  if (!(this instanceof collection)) return new collection(elements)
  collection.super_.call(this, elements)
}

assign(collection.prototype, {
  show: function () {
    return this.each(function (d) {
      d.attributes.visible = true
    })
  },

  hide: function () {
    return this.each(function (d) {
      d.attributes.visible = false
    })
  },

  toggle: function () {
    return this.each(function (d) {
      d.attributes.visible ? d.attributes.visible = false : d.attributes.visible = true
    })
  },

  position: function (value) {
    return this.each(function (d) {
      d.position(value)
    })
  },

  scale: function (value) {
    return this.each(function (d) {
      d.scale(value)
    })
  },

  rotation: function (value, axis) {
    return this.each(function (d) {
      d.rotation(value, axis)
    })
  }
})
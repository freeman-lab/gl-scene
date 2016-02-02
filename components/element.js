module.exports = Element

function Element () {}

Element.prototype.toggle = function () {
  if (this.enabled) {
    this.enabled = false
  } else {
    this.enabled = true
  }
}

Element.prototype.hide = function () {
  this.enabled = false
}

Element.prototype.show = function () {
  this.enabled = true
}

Element.prototype.classed = function (name, value) {
  if (value) this.class = name
  if (!value) this.class = ''
  this.set()
}

Element.prototype.toggleClass = function (name) {
  if (this.class === name) {
    this.class = ''
  } else {
    this.class = name
  }
  this.set()
}
# gl-scene

Assemble simple 3d scenes using [`stack.gl`](http://stack.gl) components. The goal of this module is to make it easy to assemble shapes and lights into a scene, at a slightly higher level of abstraction, while maintaining full flexibility and composability with the `stack.gl` ecosystem. You can think of this module as a wrapper for `gl-geometry`, `gl-shader`, and `gl-mat4`, with an easy selector system for controlling appearences.

## install

Add to your project with

```javascript
npm install gl-scene --save
```

See a simple example by cloning this repo then calling

```javascript
npm start
```

And see a more complex example with

```javascript
npm run demo
```

## example

First construct a scene using a `webgl` context.

```javascript
var canvas = document.body.appendChild(document.createElement('canvas'))
var gl = require('gl-context')(canvas)
var scene = require('gl-scene')(gl)
```

A scene requires a list of shapes. It can additionally include lights and materials. Here we'll make a simple scene consisting of three spheres, representing planets. We assign an `id` a `class` to each shape so we can use them to style later, and we specify a 4x4 `model` matrix, which controls rotation, translation, and scale.

```javascript
var icosphere = require('icosphere')

var shapes = [
  {
    id: 'sun',
    complex: icosphere(4),
    model: [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1]
  },
  {
    id: 'earth', class: 'planet',
    complex: icosphere(4),
    model: [1.5, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 1.5, 0, 6, 0, 0, 1]
  },
  {
    id: 'mars', class: 'planet',
    complex: icosphere(4),
    model: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 8, 0, 1]
  },
]
```

We'll now define styles for these shapes by mapping from `id` or `class` to material properties. We'll put a nice emmisive color on all shapes, and add a diffuse component for the planets.

```javascript
var styles = [
  {tag: '#sun', emissive: [0.9, 0.9, 0.0]},
  {tag: '#earth', emissive: [0.0, 0.2, 0.5]},
  {tag: '#mars', emissive: [0.3, 0.0, 0.0]},
  {tag: '.planet', diffuse: [0.1, 0.1, 0.1]}
]
```

You can now add these shapes to the scene.

```javascript
scene.shapes(shapes, styles)
```

Let's also add a light: a bright yellow one to represent the sun! Specify a list with an `id` and 4x1 `position` for each light.

```javascript
var lights = [
  {id: 'sun', position: [0, 0, 0, 1]}
]
```

And then set styles. We'll make it bright yellow, with only weak ambient light.

```javascript
var styles = [
  {tag: '#sun', color: [0.8, 0.8, 0.0], brightness: 20.0, ambient: 0.05, attenuation: 0.01}
]
```

Now add the lights to the scene

```javascript
scene.lights(lights, styles)
```

Then initialize and draw!

```javascript
scene.init()
scene.draw()
```

## methods

### initialization

#### `scene(gl, opts)`

Construct a scene by providing a `webgl` context. [expand]

#### `scene.shapes(shapes, styles)`

Add a list of `shapes` to the scene, using a set of `styles`. [expand]

#### `scene.lights(lights, styles)`

Add a list of `lights` to the scene, alongside a set of `styles`. [expand]

#### `scene.materials(materials)`

Specify a list of `materials` to use. [expand]

### rendering

#### `scene.init()`

Initialize the scene, check that required properties are defined, and replace missing properties with defaults where possible, as follows. For shapes without a material, the material will be `flat`. If a shape has undefined material properties, they will be replaced with the defaults.

#### `scene.update(camera)`

Update the scene's projection and view matrices from the provided `camera`, which must have a `view` method. For examples see: `canvas-orbit-camera`

#### `scene.draw()`

Draw the scene to the `webgl` context.

### manipulation

Manipulation is based on first selecting an element of interest (shape or light) and then adjusting its properties.

TOOD Generalize all of these to work on arrays via a `selectAll` operator.

TODO Support multiple classes per element.

#### `scene.select(selector)`

Returns the first `element` that matches the given tag. Selector should be of the form:
- `#id`
- `.class`
- `shape #id` 
- `shape .class`
- `light #id`
- `light .class`

If `shape` or `light` is unspecified, will first look for a matching shape, and then a matching light.

#### `element.move(func)`

Move an element by providing a function `func` that should take as input a `model` matrix (for shapes) or a `position` vector (for lights).

```javascript
scene.find('#earth').move(function (model) {mat4.translate(model, model, [0, 5, 0])})
```

#### `element.hide()`

Hide the given element. For a shape, will remove it from the scene. For a light, will remove its effects.

#### `element.show()`

Show the given element.

#### `element.toggle()`

Show or hide the given element depending on its current state.

#### `element.style({name: value})`

Set one or more style properties on the element.

```javascript
scene.find('#earth').style({emissive: [0.6, 0.2, 0.1]})
```

#### `element.classed(name, value)`

Set class `name` on the element to `value`, which should be truthy.

```javascript
scene.find('#earth').classed('planet', false)
```

#### `element.toggleClass(name)`

Add or remove class `name` on the given element depending on its current state.

```javascript
scene.find('#earth').toggleClass('planet')
```



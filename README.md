# gl-scene

[![NPM version][npm-image]][npm-url]
![experimental][experimental-image]
[![js-standard-style][standard-image]][standard-url]

Design and manipulate simple 3d scenes using [`stack.gl`](http://stack.gl) components. The goal of this module is to make it easy to build and manipulate scenes with shapes and lights, while maintaining full flexibility and composability with the [`stack.gl`](http://stack.gl) ecosystem, including the emphasis on writing modular shader code. It provides a higher-level interface on top of core stack.gl components, and includes a CSS style selector system for controlling appearence. Much of the functionality is defined in separate modules that can be used on their own, in particular [`gl-material`](http://github.com/stackgl/gl-material) and [`gl-shape`](http://github.com/stackgl/gl-shape). 

![fruit](gifs/fruit.gif)

## install

Add to your project with

```
npm install gl-scene
```

## example

We'll make a very simple scene with a bunny lit by a green light. 

First get yourself a `webgl` context. There are many ways to do this, but here's an easy one.

```javascript
var canvas = document.body.appendChild(document.createElement('canvas'))
var gl = require('gl-context')(canvas)
require('canvas-fit')(canvas)
```

Create the scene by passing options for background color:

```javascript
var scene = require('./index.js')(gl, {
  background: [0.02, 0.02, 0.02]
})
```

No add a shape and a light

```javascript
var shapes = [{
  complex: require('bunny'),
  position: [0, -8, 12],
  material: 'lambert',
  style: {diffuse: [0.7, 0.7, 0.7]}
}]

var lights = [{
  position: [0, 0, 20], style: {intensity: 8.0, color: [0.2, 0.7, 0.2]}
}]

scene.shapes(shapes)
scene.lights(lights)
```

And initialize and draw the scene

```javascript
scene.init()
scene.draw()
```

See the [example](example.js) for a slightly more involved scene, and see the [fruit](demos/fruit.js) • [spheres](demos/spheres.js) • [cubes](demos/cubes.js) demos for behaviors like selection, updating, and camera integration.

## components

There are three key concepts used in `gl-scene`, most of which are implemented in other modules.

#### materials

Materials define the appearance of shapes, and how they interact with lights. Rather than predefine all matrials, `gl-material` is designed so that materials can be published as npm modules! The module [`gl-material`](https://github.com/freeman-lab/gl-material) defines and tests a common format for materials, which is simply a shader and list of properties that can be set. You can then specify materials for shapes by name and add them to your scene:

```javascript
var material = require('gl-normal-material')

var shapes = [
  {
    complex: icosphere(4),
    position: [0, 0, 0],
    material: 'normal'
  },
]

scene.shapes(shapes)
scene.materials({normal: material})
```

#### styles

Styles can be specified for each shape or light directly, but you can also add a `stylesheet` to your scene, and give each element an `id` and a `class`, which makes it easy to set or update styles. For example in the above example we could have defined each light with `class: 'glow'` and set common styles using

```javascript
var stylesheet = {
  '.glow': {brightness: 8.0, ambient: 0.0, attenuation: 0.01}
}

scene.stylesheet(stylesheet)
```

#### selections

You can select shapes and lights by their `id` or `class` and manipulate them, with methods inspired by the visualization library `d3`. For example, the following would reposition the `orange` shape and increase the brightness of all `glow` lights:

```javascript
scene.select('#orange').position([-5, -5, 8])
scene.selectAll('.glow').style({brightness: 16.0})
```

Most of this logic is handled by [`selectify`](https://github.com/freeman-lab/selectify).

## methods

### initialization

#### `scene(gl, opts)`

Construct a scene by providing a `webgl` context.

**Options:**  
- `gl` – A `webgl` context. **Required.**
- `opts` is an optional object with these properties:
  - `fov` – field of view. Default: `Math.PI / 4`
  - `near` – Default: `0.01`
  - `far` – Default: `1000`
  - `target` – Default: `[0, 0, 0]`
  - `observer` – Position for the camera view. Default: `[0, -10, 30]`
  - `background` – An RGB color as an array of floats. Example: `[1.0, 0.0, 0.0]`

#### `scene.shapes(shapes)`

Add a list of `shapes` to the scene, using a set of `styles`.

Each shape in the `shapes` array has these properties:

- `id` – A string with a unique id. **Required**
- `complex` – A 3d mesh for rendering the shape. **Required**
- `class` – Similar to a css class, for use as a selector.
- `material` – A material created using [gl-scene-material](https://github.com/freeman-lab/gl-scene-material) or a compatible module.
- `position` – The initial position of the shape, provided as an array of floats: `[x, y, z]`
- `scale` – The initial size of the shape, provided as a number or as a function that accepts an array with `x, y, z` coordinates as an argument and returns an array with `x, y, z` coordinates.
- `style` An object with CSS-like properties for controlling the style of the shape.

#### `scene.lights(lights)`

Add a list of `lights` to the scene, alongside a set of `styles`.

Each light in the `lights` array has these properties:

- `id` – A string with a unique id. **Required**
- `position` – The initial position of the shape, provided as an array of floats: `[x, y, z]`. **Required**
- `class` – Similar to a css class, for use as a selector.
- `style` An object with CSS-like properties for controlling the style of the light.

#### `scene.materials(materials)`

Specify an object of named `materials` to use. [expand]

### rendering

#### `scene.init()`

Initialize the scene. Checks that required properties are defined, and replaces missing properties with defaults where possible, as follows. For shapes without a material, the material will be `lambert`. If a shape has undefined material properties, they will be replaced with the defaults for the material. A single light above the origin will be created.

#### `scene.draw(camera)`

Draw the scene to the `webgl` context with an optional `camera`, which must have a `view` method. 

Compatible cameras: 
- [`canvas-orbit-camera`](https://npmjs.com/canvas-orbit-camera)

### manipulation

All manipulation proceeds by first selecting one or more elements -- shape or light -- and then changing properties.

#### `selection = scene.select(selector)`

Returns the first light or shape that matches the given tag. Selector should be of the form: `#id` or `.class`. Will first look for a matching shape, and then a matching light.

#### `selection = scene.selectAll(selector)`

Returns all shapes or lights that match the given tag. Selector should be of the form: `#id` or `.class`.Will first look for matching shapes, and then matching lights.

#### `selection.style({name: value})`

Set one or more styles on the selection. Can provide an object pf the form `{name: value}` or `{name1: value1, name2: value2}`, or two arguments of the form `name, value`.

#### `selection.classed(name, value)`

Set class `name` on the selection to `value`, which should be truthy.

#### `selection.toggleClass(name)`

Add or remove class `name` on the selection, depending on its current state.

#### `selection.hide()`

Hide the selection. For a shape, will remove it from the scene. For a light, will remove its effect on the scene.

#### `selection.show()`

Show the selection. For a shape, will add it back to the scene. For a light, will include its effect on the scene.

#### `selection.toggle()`

Show or hide the selection depending on its current state.

#### `selection.position([x, y, z])`

Set the position of the selection. Should be a length 3 vector for a shape, or a length 3 or 4 vector for a light. Can also provide a function which takes the current position as input and should return the new position.

#### `selection.scale([x, y, z])`

Set the scale of the selection. Only for shapes. Should be a length 3 vector or float (which will scale all dimensions). Can also provide a function which takes the current scale as input and should return the new scale.

#### `selection.rotation(angle, [axis])`

Set the rotation of the selection. Only for shapes. Should provide `angle` in radians and a length 3 vector for `axis`. Can also provide a function which takes the current 3x3 rotation matrix as input and should return the new rotation.

[npm-image]: https://img.shields.io/badge/npm-v1.0.0-lightgray.svg?style=flat-square
[npm-url]: https://npmjs.org/package/gl-scene
[standard-image]: https://img.shields.io/badge/code%20style-standard-lightgray.svg?style=flat-square
[standard-url]: https://github.com/feross/standard
[experimental-image]: https://img.shields.io/badge/stability-experimental-lightgray.svg?style=flat-square

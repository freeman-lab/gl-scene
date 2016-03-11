# gl-scene

[![NPM version][npm-image]][npm-url]
![experimental][experimental-image]
[![js-standard-style][standard-image]][standard-url]

Design and manipulate 3d scenes using [`stack.gl`](http://stack.gl) components. 

The goal of this module is to make it easier to build 3d scenes, while maintaining full flexibility and composability with the [`stack.gl`](http://stack.gl) ecosystem, including the emphasis on writing modular shader code. It provides a higher-level interface on top of core `stack.gl` components, and includes a CSS style selector system for controlling appearence. Much of the functionality is defined in separate modules that can be used on their own, in particular [`gl-material`](http://github.com/stackgl/gl-material) and [`gl-shape`](http://github.com/stackgl/gl-shape). 

![fruit](gifs/fruit.gif)

## install

Add to your project with

```
npm install gl-scene
```

## example

We'll make a very simple scene with a bunny bathed in blue light.

```javascript
// First get yourself a `webgl` context. There are many ways to do this, but here's an easy one.

var canvas = document.body.appendChild(document.createElement('canvas'))
var gl = require('gl-context')(canvas)
require('canvas-fit')(canvas)

// Create the scene by passing options for background color:

var scene = require('gl-scene')(gl, {
  background: [0.02, 0.02, 0.02]
})

// Now add a shape and a light

var shapes = [{
  complex: require('bunny'),
  position: [0, -8, 12],
  material: 'lambert',
  style: {diffuse: [0.7, 0.7, 0.7]}
}]

var lights = [{
  position: [0, 0, 20], 
  style: {intensity: 10.0, color: [0.2, 0.5, 0.9]}
}]

scene.shapes(shapes)
scene.lights(lights)

// And initialize and draw the scene

scene.init()
scene.draw()
```

See [example.js](example.js) for a slightly more complex scene, and see the [fruit](demos/fruit.js) • [spheres](demos/spheres.js) • [cubes](demos/cubes.js) demos for behaviors like selection, updates, stylesheets, cameras, and more! You can run these by cloning this repo and then calling `npm install` and `npm run example`, or `npm run demo <name>`.

## components

There are three key components used by `gl-scene`, most of which are implemented in other modules.

#### materials

Materials define the appearance of shapes, and how they interact with lights. Rather than predefine all matrials, we want lots of different materials to be published as npm modules! The module [`gl-material`](https://github.com/freeman-lab/gl-material) defines a common format for materials, which is simply a shader and list of style properties that can be set on it. You can then specify materials for shapes by name and add them to your scene:

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

For convienence, some common material are included with `gl-scene` by default.

#### styles

Styles can be specified for each shape or light directly, but you can also add a `stylesheet` to your scene, and give each element an `id` and a `class`. This makes it easy to set or update styles, just like in CSS. For example in the above example we could have defined our light with `class: 'blue'` and set styles using

```javascript
var stylesheet = {
  '.blue': {intensity: 10.0, color: [0.2, 0.5, 0.9]}
}

scene.stylesheet(stylesheet)
```

#### selections

You can select shapes and lights by their `id` or `class` and manipulate them, with methods inspired by the visualization library `d3`. For example, the following would move the `bunny` shape and double the brightness of any `blue` lights:

```javascript
scene.select('#bunny').position([-5, -5, 8])
scene.selectAll('.blue').style({brightness: 20.0})
```

Most of this logic is handled by [`selectify`](https://github.com/freeman-lab/selectify).

## methods

### initialization

#### `scene(gl, opts)`

Construct a scene by providing a `webgl` context as `gl` and optional parameters as `opts`. 

The options are:
- `fov` field of view, default `Math.PI / 4`
- `near` near distance, default `0.01`
- `far` far distance, default `1000`
- `target` target for default view, default `[0, 0, 0]`
- `observer` camera position for default view, fefault `[0, -10, 30]`
- `background` background color in RGB, if provided will clear on draw

#### `scene.shapes(shapes)`

Add a list of `shapes` to the scene.

Each shape in the `shapes` array has these properties:
- `complex` a 3d mesh for rendering the shape, must define `positions` and `faces`, can define `normals` and `uvs` **required**
- `flatten` whether to flatten the mesh, default `true`
- `material` a material name, default `lambert`
- `position` iniitial position of the shape as an array of floats, default `[0, 0, 0]`
- `scale` initial scale of the shape as a number or an array of floats, default `1`
- `id` a string with a unique id for use as a selector, default `shape-<index>`
- `class` similar to a css class for use as a selector, default `none`
- `style` an object with CSS-like properties for controlling the style of the shape

See [`gl-shape`](https://github.com/freeman-lab/gl-shape) for more details on the core implementation.

#### `scene.lights(lights)`

Add a list of `lights` to the scene. 

Each light in the `lights` array has these properties:
- `position` initial position of the shape as an array of floats, default `[0, 0, 0]`
- `id` a string with a unique id for use as a selector, default `light-<index>`
- `class` similar to a css class, for use as a selector, default `none`
- `style` an object with CSS-like properties for controlling the style of the light

See [`gl-light`](https://github.com/freeman-lab/gl-light) for more details on the core implementation.

#### `scene.materials(materials)`

Specify an object of named `materials` to use. [expand]

### rendering

#### `scene.init()`

Initialize the scene. Checks that required properties are defined, and replaces missing properties with defaults where possible. If a shape has undefined styles, they will be replaced with the defaults for the material. Undefined light styles will be set as for a white point light. Because some materials require a light to be specified, a single light above the origin will be created.

#### `scene.draw(camera)`

Draw the scene to the `webgl` context with an optional `camera`. 

The `camera` must have a `view` method, which will be used to update the view before drawing. The following are supported:
- [`canvas-orbit-camera`](https://npmjs.com/canvas-orbit-camera)
- [`game-shell-orbit-camera`](https://npmjs.com/game-shell-orbit-camera)
- [`first-person-camera`](https://npmjs.com/first-person-camera)

### manipulation

All manipulation proceeds by selecting one or more shapes or lights by `id` or `class` and then changing properties.

#### `selection = scene.select(selector)`

Returns the first light or shape that matches the given tag. Selector should be of the form: `#id` or `.class`. Will first look for a matching shape, and then a matching light.

#### `selection = scene.selectAll(selector)`

Same as `select`, but will return all matching elements.

#### `selection.style({name: value})`

Set one or more styles on the selection. Can provide an object of the form `{name: value}` or `{name1: value1, name2: value2}`, or two arguments of the form `name, value`.

#### `selection.classed(name, value)`

Set class `name` on the selection to `value`, which should be truthy. If only `name` is specified, will return the current class.

#### `selection.toggleClass(name)`

Add or remove class `name` on the selection, given its current setting.

#### `selection.hide()`

Hide the selection. For a shape, will remove it from the scene. For a light, will remove its effect on the scene.

#### `selection.show()`

Show the selection. For a shape, will add it back to the scene. For a light, will include its effect on the scene.

#### `selection.toggle()`

Show or hide the selection given its current state.

#### `selection.position([x, y, z])`

Set the position of the selection. Should be a length 3 vector for a shape, or a length 3 or 4 vector for a light. Can also provide a function which takes the current position as input and returns a new position.

#### `selection.scale([x, y, z])`

Set the scale of the selection. Only for shapes. Should be a length 3 vector or float (which will scale all dimensions). Can also provide a function which takes the current scale as input and returns a new scale.

#### `selection.rotation(angle, [axis])`

Set the rotation of the selection. Only for shapes. Should provide `angle` in radians and a length 3 vector for `axis`. Can also provide a function which takes the current 3x3 rotation matrix as input returns a new rotation matrix.

## contributing

If you have ideas or problems, post an issue or submit a PR!

## comparisons

How does this module compare to other approaches?

Everything here can be done using lower-level [`stack.gl`](http://stack.gl) components directly, and if you know what you're doing that will always be a more flexible approach! But hopefully this module provides some useful abstractions that make it easier to get started (if you're new), and make it easier to reason about more complex scenes. 

Compared to [`three.js`](http://threejs.org/), this approach, and `stack.gl` in general, favors small modules and composition over complex class hierarchies and bundling everythng together. For example, rather than predefine a class hierarchy of materials, `gl-scene` and `gl-material` encourage publishing materials as individual, versioned npm modules. But `three.js` is an awesome project and might be exactly what you want! It definitely offers way more functionality than `gl-scene`, especially for things like complex lighting and shadow mapping, though hopefully we can add some of that with new modules.

## license

MIT

[npm-image]: https://img.shields.io/badge/npm-v1.0.0-lightgray.svg?style=flat-square
[npm-url]: https://npmjs.org/package/gl-scene
[standard-image]: https://img.shields.io/badge/code%20style-standard-lightgray.svg?style=flat-square
[standard-url]: https://github.com/feross/standard
[experimental-image]: https://img.shields.io/badge/stability-experimental-lightgray.svg?style=flat-square

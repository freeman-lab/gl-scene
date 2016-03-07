# gl-scene

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)


Simple 3d scenes using [`stack.gl`](http://stack.gl) components. The goal of this module is to make it easy to build and manipulate scenes with shapes and lights, while maintaining full flexibility and composability with the [`stack.gl`](http://stack.gl) ecosystem, including the emphasis on writing modular shader code. You can think of this module as a wrapper for [`gl-geometry`](http://github.com/stackgl/gl-geometry), [`gl-shader`](http://github.com/stackgl/gl-shader), and [`gl-mat4`](http://github.com/stackgl/gl-mat4), with a CSS style selector system for controlling appearence.

![christmas](gifs/christmas-wide-brighter.gif)

## install

For now, clone the repo and install with

```
npm install
```

See a simple example by calling

```
npm run example
```

And see a more complex example with

```bash
npm run demo < fruit | cubes | spheres >
```

## example

We'll make a simple static scene from scratch. 

First get yourself a `webgl` context. There are many ways to do this, but here's an easy one.

```javascript
var canvas = document.body.appendChild(document.createElement('canvas'))
var gl = require('gl-context')(canvas)
require('canvas-fit')(canvas)
```

Now create the scene, passing options for background color and observer position

```javascript
var scene = require('gl-scene')(gl, {
  observer: [0, -18, 8], 
  background: [0.02, 0.02, 0.02]
})
```

A scene requires a list of shapes. Our scene will be three spheres on a flat surface. We can set an `id` for selecting later, and we specify a `position` and/or `scale`, which automatically gets turned into a `4x4` model matrix.

```javascript
var icosphere = require('icosphere')
var extrude = require('extrude')

var shapes = [
  {
    id: 'floor'
    complex: extrude([[-50, 50], [-50, -50], [50, -50], [50, 50]], {top: 0, bottom: -2}),
    position: [0, 0, 0],
  },
  {
    id: 'apple',
    complex: icosphere(4),
    position: [8, 0, 1]
  },
  {
    id: 'orange',
    complex: icosphere(4),
    position: [-5, -5, 2], scale: 2
  },
  {
    id: 'pear',
    complex: icosphere(4),
    position: [0, 8, 3], scale: 3
  }
]
```

Then add the shapes to our scene, initialize, and draw!

```javascript
scene.shapes(shapes)
scene.init()
scene.draw()
```

It should look like:

![example-0](pngs/example-stage-0.png)

We didn't specify any lights, so we got the default: a white light above the origin. Let's make a bright colored light centered on each sphere. We define a list of lights just as we did with shapes, and set a style for each one.

```javascript
var lights = [
  {
    position: [0, 8, 3], 
    style: {color: [0.0, 0.9, 0.1], brightness: 8.0, ambient: 0.0, attenuation: 0.01}},
  {
    position: [8, 0, 1], 
    style: {color: [0.8, 0.1, 0.0], brightness: 8.0, ambient: 0.0, attenuation: 0.01}},
  {
    position: [-5, -5, 2], 
    style: {color: [0.9, 0.6, 0.0], brightness: 8.0, ambient: 0.0, attenuation: 0.01}}
]
```

We'll also set the styles on the spheres to match our lights. For both shapes and lights can be set on construction (as above), or afterward with selectors.

```javascript
scene.select('apple').style({emissive: [0.8, 0.1, 0.0], diffuse: [0.1, 0.1, 0.1]})
scene.select('pear').style({emissive: [0.0, 0.9, 0.1], diffuse: [0.1, 0.1, 0.1]})
scene.select('orange').style({emissive: [0.9, 0.6, 0.0], diffuse: [0.1, 0.1, 0.1]})
scene.select('floor').style({diffuse: [0.3, 0.3, 0.3]})
```

Add the lights to the scene, reinitialize, and redraw!

```javascript
scene.lights(lights)
scene.init()
scene.draw()
```

Glowing fruit!

![example-1](pngs/example-stage-1.png)

See the [example](example.js) for a script that generates this image, see the [fruit demo](demos/fruit.js) for a version that adds a moveable `camera` and uses `select` to dynamically turn the glowing on and off, and see the [spheres](demos/sphere.js) and [cubes](demos/cubes.js) demos for other kinds of scenes.

## components

There are three key components to `gl-scene`, most of which are implemented in other modules.

#### materials

Materials define the appearance of shapes, and how they interact with lights. Rather than predefine all matrials, `gl-scene` is designed so that materials can be published as npm modules! The module [`gl-scene-material`](https://github.com/freeman-lab/gl-scene-material) defines and tests a common format for materials, which is simply a shader and list of properties that can be set. You can then specify materials for shapes and add them to your scene:

```javascript
var material = require('gl-scene-normal-material')

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

You can use [`gl-scene-demo-material`](https://github.com/freeman-lab/gl-scene-demo-material) to easily demo your materials.

#### styles

Styles can be specified for each shape or light directly, but you can also add a `stylesheet` to your scene, and give each element an `id` and a `class`, which makes it easy to set or update styles. For example in the above example we could have defined each light with `class: 'glow'` and set common styles using

```javascript
var stylesheet = {
  '.glow': {brightness: 8.0, ambient: 0.0, attenuation: 0.01}
}

scene.stylesheet(stylesheet)
```

#### selections

You can select shapes and lights by their `id` or `class` and manipulate them, with methods inspired by the visualization library `d3`. For example, the following would move the `orange` shape and increase the brightness of all `glow` lights:

```javascript
scene.select('#orange').position([-5, -5, 8])
scene.selectAll('.glow').style({brightness: 16.0})
```

Most of this logic is handled by [`selectify`](https://github.com/freeman-lab/selectify).

## methods

### initialization

#### `scene(gl, opts)`

Construct a scene by providing a `webgl` context. [expand]

#### `scene.shapes(shapes)`

Add a list of `shapes` to the scene, using a set of `styles`. [expand]

#### `scene.lights(lights)`

Add a list of `lights` to the scene, alongside a set of `styles`. [expand]

#### `scene.materials(materials)`

Specify an object of named `materials` to use. [expand]

### rendering

#### `scene.init()`

Initialize the scene. Checks that required properties are defined, and replaces missing properties with defaults where possible, as follows. For shapes without a material, the material will be `lambert`. If a shape has undefined material properties, they will be replaced with the defaults for the material. A single light above the origin will be created.

#### `scene.update(camera)`

Update the scene's projection and view matrices using the provided `camera`, which must have a `view` method. Compatible cameras: 
- `canvas-orbit-camera`

#### `scene.draw()`

Draw the scene to the `webgl` context.

### manipulation

All manipulation proceeds by first selecting one or more elements -- shape or light -- and then changing properties.

#### `scene.select(selector)`

Returns the first light or shape that matches the given tag. Selector should be of the form: `#id` or `.class`. Will first look for a matching shape, and then a matching light.

#### `scene.selectAll(selector)`

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

## TODO

- Tests!

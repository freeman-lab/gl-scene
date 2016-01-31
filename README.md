# gl-scene

Assemble simple 3d scenes using stack.gl components. The goal of this module is to make it easy to assemble shapes and lights into a scene, at a slightly higher level of abstraction, while maintaining full flexibility and composability with the stack.gl ecosystem. You can think of this module as a wrapper for `gl-geometry`, `gl-shader`, and `gl-mat4`, with a simple selector-based system for controlling appearences.

### install

Add to your project with

```javascript
npm install gl-scene --save
```

View the demo by cloning this repo then calling

```javascript
npm start
```

### example

First construct the scene using a `webgl` context.

```javascript
var context = require('gl-now')()
var scene = require('gl-scene')(context.gl)
```

A scene consists of shapes and lights. Here, we'll just make two translated spheres.

```javascript
var mat4 = require('gl-mat4')
var icosphere = require('icosphere')

var shapes = [
	{
		id: 'apple',
		class: 'sphere',
		complex: icosphere(),
		move: mat4.translate(mat4.create(), mat4.create(), [5, 0, 0])
	},
	{
		id: 'orange',
		class: 'sphere',
		complex: icosphere(),
		move: mat4.translate(mat4.create(), mat4.create(), [0, 5, 5])
	}
]
```

Now define style options for these shapes by mapping from `id` or `class` to options.

```javascript
var opts = {
	{
		tag: '.sphere',
		shader: 'flat'
	},
	{
		tag: '#apple'
		color: [0.0, 0.6, 0.0]
	},
	{
		tag: '#orange'
		color: [0.5, 0.5, 0.0]
	}
}
```

Add these shapes to the scene, initialize, and draw!

```javascript
scene.shapes(shapes, opts)
scene.init()
scene.draw()
```

If you want a dynamic camera, make on, and then call `update` and `draw` on your render event

```javascript
var camera = require('canvas-orbit-camera')

context.on('gl-render', function (t) {
	camera.tick()
	scene.update(camera)
	scene.draw()	
})
```

### shapes

Specify a list of shapes each with an `id`, `class`, `complex`, and `move`
Specify a list of style options each with a tag `#id` or `.class` and a set of options.

### lights

Specify a list of lights each with an `id`, `class`, and `move`.
Specify a list of style options each with a tag `#id` or `.class` and a set of options.

### shaders

Several default shaders (corresponding to different materials) are included, and for many simple scenes you won't need to work with them directly, but it's easy to pass your own shaders as well.

TODO explain how

### API

scene(gl)

scene.shapes(shapes, opts)

scene.lights(lights, opts)

scene.shaders(shaders)

scene.find(selector)

scene.move(selector, cb)

scene.hide(selector)

scene.show(selector)

### defaults

Try to use sensible defaults. If no material is specified, will use `flat`. For each shape, missing attributes will be set to their default as specified in the material definition.
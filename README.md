# gl-scene

Assemble simple 3d scenes using stack.gl components. The goal of this module is to make it easy to assemble scenes, at a slightly higher level of abstraction, while maintaining full flexibility and composability with the stack.gl ecosystem.

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
var Scene = require('gl-scene')

var scene = Scene(context.gl)
```

Define one or more shapes by specifying an `id`, a `class`, a simplicial `complex`, and a `move` matrix. Here, we'll just make two translated spheres.

```javascript
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

Now define style options for these shapes. You just need to define a mapping from `id` or `class` to options. For any shape, the options from both `class` and `id` will be used, but if they conflict the `id` will take precedence.

```javascript
var opts = {
	sphere: {
		shader: 'flat'
	}
	apple: {
		color: [0.0, 0.6, 0.0]
	},
	orange: {
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
var camera = require('canvas-orbit-camera')'

context.on('gl-render', function (t) {
	camera.tick()
	scene.update(camera)
	scene.draw()	
})
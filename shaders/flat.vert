precision highp float;

attribute vec3 position;
attribute vec3 normal;

uniform mat4 proj;
uniform mat4 view;
uniform mat4 move;
uniform mat4 animate;

varying vec3 vposition;
varying vec3 vnormal;

void main() {
	vposition = (move * animate * vec4(position, 1.0)).xyz;
	mat4 nmove = move;
	mat4 nanimate = animate;
	nmove[3][0] = 0.0;
	nmove[3][1] = 0.0;
	nmove[3][2] = 0.0;
	nanimate[3][0] = 0.0;
	nanimate[3][1] = 0.0;
	nanimate[3][2] = 0.0;
	vnormal = normalize((nmove * nanimate * vec4(normal, 1.0)).xyz);
 	gl_Position = proj * view * move * animate * vec4(position, 1.0);
}
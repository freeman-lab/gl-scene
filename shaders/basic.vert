precision highp float;

attribute vec3 position;
attribute vec3 normal;

uniform mat4 proj;
uniform mat4 view;
uniform mat4 move;
uniform mat4 animate;

uniform mat3 moveT;
uniform mat3 animateT;

varying vec3 vposition;
varying vec3 vnormal;

void main() {
	vposition = (animate * move * vec4(position, 1.0)).xyz;
	vnormal = normalize(animateT * moveT * normal);
 	gl_Position = proj * view * animate * move * vec4(position, 1.0);
}
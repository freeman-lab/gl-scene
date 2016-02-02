precision highp float;

attribute vec3 position;
attribute vec3 normal;

uniform mat4 proj;
uniform mat4 view;
uniform mat4 model;
uniform mat4 animate;

uniform mat3 model_ti;
uniform mat3 animate_ti;

varying vec3 vposition;
varying vec3 vnormal;

void main() {
  vposition = (model * animate * vec4(position, 1.0)).xyz;
  vnormal = normalize(model_ti * animate_ti * normal);
  gl_Position = proj * view * model * animate * vec4(position, 1.0);
}
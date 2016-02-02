precision highp float;

varying vec3 vposition;
varying vec3 vnormal;
uniform vec3 eye;

#pragma glslify: BasicLighting = require('glsl-basic-lighting')

uniform LIGHTTYPE lights[LIGHTCOUNT];
uniform MATERIALTYPE material;

void main() {
  vec3 viewpoint = eye - vposition;

  vec3 result = vec3(0.0);
  vec3 component; 
  for (int i = 0; i < LIGHTCOUNT; ++i) {
    result += BasicLighting(lights[i], material, vnormal, vposition, viewpoint);
  }

  gl_FragColor = vec4(result, 1);
}
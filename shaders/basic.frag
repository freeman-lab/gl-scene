precision highp float;

varying vec3 vposition;
varying vec3 vnormal;
uniform vec3 eye;
uniform float fogged;

#pragma glslify: Lighting = require('glsl-basic-lighting')
//#pragma glslify: Material = require('glsl-basic-material')
//#pragma glslify: Light = require('glsl-basic-light')

uniform LIGHTTYPE lights[4];
uniform MATERIALTYPE material;

void main() {
	vec3 viewpoint = eye - vposition;

	vec3 result = vec3(0.0);
	vec3 component;
	
	for (int i = 0; i < 4; ++i) {
		result += Lighting(lights[i], material, vnormal, vposition, viewpoint);
	}

 	gl_FragColor = vec4(result, 1);
}
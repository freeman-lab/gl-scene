precision highp float;

uniform vec3 color;

void main() {
	vec3 result = color;
 	gl_FragColor = vec4(result, 1);
}
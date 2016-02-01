#pragma glslify: orenn = require('glsl-diffuse-oren-nayar')
#pragma glslify: blinn = require('glsl-specular-blinn-phong')
#pragma glslify: Light = require('glsl-basic-light')
#pragma glslify: Material = require('glsl-basic-material')

vec3 Lighting(Light light, Material material, vec3 normal, vec3 position, vec3 viewpoint) {
	if (!light.enabled) {return vec3(0.0);}
	
	float attenuation;
	float angle;
	vec3 direction;

	if (light.position.w == 0.0) {
		direction = normalize(light.position.xyz);
		attenuation = 1.0;
	} else {
		direction = light.position.xyz - position;
		attenuation = 1.0 / (1.0 + light.attenuation * pow(length(direction), 2.0));
		angle = degrees(acos(dot(-normalize(direction), normalize(light.target - light.position.xyz))));
		if (angle > light.cutoff) {
            attenuation = 0.0;
        }
	}

    float diffuse = orenn(normalize(direction), normalize(viewpoint), normal, material.roughness, 0.7);
    float specular = blinn(normalize(direction), normalize(viewpoint), normal, material.shininess);

    vec3 ambient = light.ambient * material.ambient;
    vec3 combined = diffuse * material.diffuse + specular * material.specular;
	return material.emissive + ambient + attenuation * combined * light.color * light.brightness;
}

#pragma glslify: export(Lighting)
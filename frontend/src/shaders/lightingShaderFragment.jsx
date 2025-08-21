const glsl = x => x;

const code = glsl`
precision highp float;

uniform vec4 uColor;
uniform sampler2D uNormalMap;
uniform sampler2D uTexture;
uniform float uSpecularStrength;

varying vec2 vUV;
varying mat3 vTBN;
varying vec3 vLightDirection;
varying vec3 vWSNormal;
varying vec3 vViewDir;

vec3 diffuse(vec3 lightDir, float lightDist, vec3 lightColor, float lightRange, vec3 normal) {
	float att = max((lightRange - lightDist) / lightRange, 0.0);
	float nDotL = max(-dot(normal, lightDir), 0.0);
	return att * nDotL * lightColor;
}

vec3 specular(vec3 lightDir, float lightDist, vec3 lightColor, float lightRange, vec3 normal) {
	float specularShininess = 32.;
	vec3 reflectDir = reflect(lightDir, normal);
	float att = max((lightRange - lightDist) / lightRange, 0.0);
	float specularIntensity = pow(max(dot(vViewDir, reflectDir), 0.0), specularShininess);
	return att * uSpecularStrength * specularIntensity * lightColor;
}

void main()
{
	vec3 normalColor = texture2D(uNormalMap, fract(vUV)).rgb;
	float lightAmbient = (normalColor.r + normalColor.g + normalColor.b) * 0.2;
	normalColor = normalColor.rgb * 2. - 1.;

	vec4 texColor = texture2D(uTexture, fract(vUV));

	vec3 mappedNormal = normalize(vTBN * normalColor);
	float lightDist = length(vLightDirection);
	vec3 lightDir = normalize(vLightDirection);

	vec3 light = diffuse(lightDir, lightDist, vec3(1,1,1), 500., mappedNormal) + specular(lightDir, lightDist, vec3(1,1,1), 500., mappedNormal);
    gl_FragColor = texColor * uColor * vec4(max(light, vec3(lightAmbient)), 1.);
}
`

export default code
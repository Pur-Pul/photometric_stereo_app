const glsl = x => x;

const code = glsl`
precision highp float;

uniform vec4 uColor;
uniform sampler2D uNormalMap;

varying vec2 vUV;
varying mat3 vTBN;
varying vec3 vLightDirection;
varying vec3 vWSNormal;

vec3 diffuse(vec3 lightDir, float lightDist, vec3 lightColor, float lightRange, vec3 normal) {
	float att = max((lightRange - lightDist) / lightRange, 0.0);
	float nDotL = max(dot(normal, lightDir), 0.0);
	return att * nDotL * lightColor;
}

void main()
{
	vec4 texColor = texture2D(uNormalMap, fract(vUV));
	float lightAmbient = (texColor.r + texColor.g + texColor.b) * 0.2;
	vec3 normalColor = texColor.rgb * 2. - 1.;
	vec3 mappedNormal = normalize(vTBN * normalColor);
	float lightDist = length(vLightDirection);
	vec3 lightDir = normalize(vLightDirection);

	vec3 light = diffuse(lightDir, lightDist, vec3(1,1,1), 500., mappedNormal);
    gl_FragColor = uColor * vec4(max(light, vec3(lightAmbient)), 1.);
}
`

export default code
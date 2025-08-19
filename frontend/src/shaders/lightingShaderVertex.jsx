const glsl = x => x;

const code = glsl`
precision highp float;
attribute vec3 attPosition;
attribute vec2 attUV;
attribute vec3 attNormal;
attribute vec3 attTangent;
 
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uLightPos;

varying vec2 vUV;
varying mat3 vTBN;
varying vec3 vLightDirection;
varying vec3 vWSNormal;

void main()
{
    vec4 objectSpacePos = vec4( attPosition.xyz, 1.);
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * objectSpacePos;

    vec3 wsNormal = normalize(uWorldMatrix * vec4(attNormal, 0.0)).xyz;
    vec3 wsTangent = normalize(uWorldMatrix * vec4(attTangent, 0.0)).xyz;
    vec3 wsBitangent = normalize(cross(wsNormal, wsTangent));

    vWSNormal = wsNormal;
    vTBN = mat3(wsTangent, wsBitangent, wsNormal);

    vec4 worldSpace = uWorldMatrix * objectSpacePos;

    vLightDirection = uLightPos - worldSpace.xyz;

    vUV = attUV;

}
`
export default code
const glsl = x => x;

const code = glsl`
precision highp float;
attribute vec3 attPosition;                  // (x,y,z)
attribute vec2 attUV;              // (u,v)
 
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vUV;

void main()
{
    vec4 objectSpacePos = vec4( attPosition.xyz, 1.);
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * objectSpacePos;
    
    vUV = attUV;
}
`
export default code
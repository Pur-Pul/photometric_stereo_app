const glsl = x => x;

const code = glsl`
precision highp float;
attribute vec3 attPosition;                  // (x,y,z)
attribute vec2 attUV;              // (u,v)
 
uniform mat4 uMatrix;

varying vec2 vUV;

void main()
{
    vec4 objectSpacePos = vec4( attPosition.xyz, 1.);
    gl_Position = uMatrix * objectSpacePos;
    
    vUV = attUV;
}
`
export default code
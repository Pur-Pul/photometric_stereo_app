const glsl = x => x;

const code = glsl`
precision highp float;
varying vec2 vUV;
uniform vec4 uColor;

void main()
{
	//vec4 finalColor = vColor * texture2D( , vUV );
	//if (finalColor.a < 0.1) {
	//	discard;
	//}
    gl_FragColor = uColor * vec4(vUV.xy, 0, 1.);// * finalColor;
}
`

export default code
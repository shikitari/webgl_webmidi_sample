precision mediump float;
uniform float time;
uniform vec2  mouse;
uniform vec2  resolution;
 
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(512., 512.);
	//float d1 = abs(p.y - p.x);
  //d1 = smoothstep(0.01, 0.011, d1);

  float d1, d2;
  vec3 color = vec3(1.0, 1.0, 1.0);
  float mySin =  (sin(time) * 0.5 + 0.5) * 0.1;

  //p = (p + vec2(1.0)) * 0.5;//0 to 1;
  d1 = abs(sin(p.x * 3.14 * 4.) - (p.y * 3.14));
  d1 = smoothstep(0.02, 0.02+mySin, d1);
  color = mix(vec3(1.0, 0, 0), color, d1);

  d2 = abs(sin(p.x * 3.14 * 3.) - (p.y * 3.14));
  d2 = smoothstep(0.02, 0.03, d2);
  color = mix(vec3(0, 1.0, 0), color, d2);

	gl_FragColor = vec4(vec3(color), 1.0);
}

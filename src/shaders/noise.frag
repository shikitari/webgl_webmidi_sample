precision mediump float;

uniform float time;
uniform vec2  mouse;
uniform vec2  resolution;

#pragma glslify: noise = require(glsl-noise/simplex/2d) 
#pragma glslify: normalize0to1 = require('./modules/utils.glsl')
 
void main() {
  float brightness = noise(gl_FragCoord.xy);
  gl_FragColor = vec4(vec3(brightness), 1.);
}

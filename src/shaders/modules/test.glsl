precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform vec4 freq1;

#pragma glslify: rand = require('./modules/utils.glsl')

#define PI 3.1415926535897932384626433832795

void drawSine(inout vec4 color, in float freq, in float phaseOffset, in float amplitude, in float intensity, in vec2 pos, in vec4 srcColor) {
  float d = abs(sin(pos.x * PI * freq + phaseOffset) * amplitude - (pos.y * PI));
  d = smoothstep(0.0, 0.6, d);
  d = pow(d, intensity);
  color = mix(srcColor, color, d);
}

void main() {
  vec2 pos = (gl_FragCoord.xy * 2.0 - resolution) / min(512., 512.);
  
  vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

  float amplitude = 1.0;//scale
  float freq = 3.0;//scale
  float phaseOffset = PI * 0.3 + time * 30.0;
  float intensity = sin(time * PI / 2.) * 0.5 + 0.5;intensity = intensity * 0.2 + 0.1;
  vec4 srcColor = vec4(1.0, 0, 1.0, 1.0);

  drawSine(color, freq, phaseOffset, amplitude, intensity, pos, srcColor);

  gl_FragColor = color;
}



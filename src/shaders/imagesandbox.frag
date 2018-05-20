precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform float aspectRatioGtOne;
uniform vec2 adjustScale;
uniform sampler2D texture;
uniform float v01;
uniform float v02;
uniform float v03;
uniform float v04;
uniform float v05;
uniform float v06;
uniform float v07;
uniform float v09;

varying vec2 vTextureCoord;
varying vec4 vColor;

#define PI  3.14159265358
#define PI2 6.28318530718

vec2 indexImage(int sequence, vec2 division) {
  float divisionX = 1.0 / float(division.x);
  int xIndex = sequence - (int(float(sequence) / divisionX) * int(divisionX));
  float x = float(xIndex) * division.x;
  float y = float(sequence / int(divisionX)) * division.y;
  return vec2(x, y);
}

void createCoord(in vec2 pos, inout vec2 oddThread, inout vec2 coord, inout float threadSeq, inout vec2 threadCoord) {
  float divider = 20. * v01;
  divider = max(1.0, divider);
  vec2 coordLocal = vTextureCoord;
  coordLocal.x += 0.5;
  coordLocal.x *= (divider);
  coordLocal.y *= (divider);
  coordLocal *= adjustScale;

  coord = fract(coordLocal);
  
  oddThread.x = step(1., mod(coordLocal.y, 2.0));
  oddThread.y = step(1., mod(coordLocal.x, 2.0));
  
  // threadCoord;
  threadCoord.x = floor(coordLocal.x) / (divider - 1.);
  threadCoord.y = floor(coordLocal.y) / (divider - 1.);
  threadCoord = threadCoord * 2.0 - 1.0;
  // coord.x = fract(coord.x + oddThread.y * 0.5);

  threadSeq = threadCoord.x + (threadCoord.y * divider);
  threadSeq = threadSeq / (divider * divider);

  float d = distance((threadCoord), vec2(0,0)) ;

  //rotate
  coord = coord * 2.0 - 1.0;
  float theta =  (PI) * time * v03;
  mat2 m1 = mat2(cos(theta),-sin(theta), sin(theta),cos(theta));
  coord = m1 * coord;
  coord = coord * 0.5 + 0.5;
  coord = max(vec2(0.0, 0.0), coord);
  coord = min(vec2(1.0, 1.0), coord);
}

void image(in vec2 coord, in vec2 oddThread, inout vec4 tex) {
  float animatioSpeed = 10.0 * v02;
  vec2 scale = vec2(0.5, 0.5);// When 2 x 4 sprite sheet, scale value is vec2(0.5, 0.25).
  vec2 offset = indexImage(int(time * animatioSpeed + (1. * oddThread.y) + (1. * oddThread.x)), scale);
  // vec2 offset = vec2(indexImage(int(time), scale));
  vec4 scaleOffset = vec4(scale, offset);

  tex += texture2D(texture, coord * scaleOffset.xy + scaleOffset.zw);
}

void main() {
  vec2 pos = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

  vec2 coord;
  vec2 oddThread;
  float threadSeq;
  vec2 threadCoord;
  createCoord(pos, oddThread, coord, threadSeq, threadCoord);
  
  vec4 tex;  
  image(coord, oddThread, tex);

  gl_FragColor  = tex + vec4(0., 0., 0., 1.);

  // make graph
  // float d = step(0.01, abs(coord.y - coord.x));
  // gl_FragColor  = vec4(d, 0, coord.x, 1.);

  // gl_FragColor = vec4(threadSeq, 0, 0, 1.);
  // gl_FragColor = vec4(threadCoord, 0, 1.);
  // gl_FragColor = vec4(coord, 0, 1.);
}



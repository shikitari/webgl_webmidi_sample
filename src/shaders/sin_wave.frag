precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform float aspectRatioGtOne;
uniform vec2 adjustScale;
uniform sampler2D tex01;
uniform vec4 tex01st;
uniform float meowIntensity;
uniform int drumCount;

uniform ivec2 wave00;
uniform ivec2 wave01;
uniform ivec2 wave02;
uniform ivec2 wave03;
uniform ivec2 wave04;
uniform ivec2 wave05;
uniform ivec2 wave06;
uniform ivec2 wave07;
uniform ivec2 wave08;

uniform vec4 wavec00;
uniform vec4 wavec01;
uniform vec4 wavec02;
uniform vec4 wavec03;
uniform vec4 wavec04;
uniform vec4 wavec05;
uniform vec4 wavec06;
uniform vec4 wavec07;
uniform vec4 wavec08;

uniform float noize_intensity;
uniform float wave_speed;//If this value is 1.0 and wave frequency is 440hz, move 2pi in 1sec.
uniform float freq_scale;//If this value is 1.0 and wave freqency is 440hz, 1 cycle wave on screen coordinate.
uniform float amplitude_scale;//If this value is 1.0 and velocity is 127(max), wave reach viewport top.
uniform float light_intensity;
uniform float wave_expand;
uniform float meow_number;
uniform float meow_rotation;
uniform float meow_animation;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying vec2 vTextureOffset;

#pragma glslify: rgb2hsl = require('./modules/rgb2hsl.glsl')
#pragma glslify: hsl2rgb = require('./modules/hsl2rgb.glsl')
#pragma glslify: rand = require('./modules/rand.glsl')

#define PI  3.14159265358
#define PI2 6.28318530718

// dummy functions for validator.  glslify load actual functions.
// vec3 rgb2hsl(vec3 a1){return a1;}
// vec3 hsl2rgb(vec3 a1){return a1;}
// float rand(vec2) {return 0.0;}

vec2 textureOffset(int sequence, vec2 division) {
  float divisionX = 1.0 / float(division.x);
  int xIndex = sequence - (int(float(sequence) / divisionX) * int(divisionX));
  float x = float(xIndex) * division.x;
  float y = float(sequence / int(divisionX)) * division.y;
  return vec2(x, y);
}

void drawSine(in vec2 pos, in vec4 srcColor, inout vec4 dstColor, in int velocity, in float freq) {
  float velocityf = float(velocity) / 127.0;//midi velocity convertd. 0 to 1.
  float amplitude = velocityf * amplitude_scale * PI;
  float freqScale = freq_scale / 2.0 * (freq / 440.0);
  float phaseOffset = time * PI2 * 1.0 * wave_speed;
  float intensity = velocityf * light_intensity;

  float s = sin(pos.x * PI * freqScale + phaseOffset);

  float d = abs((s * amplitude) - (pos.y * PI));

  //ajust curve. very very tricy!
  //d = d + abs(s) * 0.5 * pow(velocityf, 4.0);
  
  d = smoothstep(0.0, wave_expand, d);
  d = pow(d, intensity);

  float circle = aspectRatioGtOne - pow(distance(pos, vec2(0.0)), 0.7);
  circle *= light_intensity;

  vec3 hsl = rgb2hsl(srcColor.xyz);
  hsl.z = (1.0 - d) * 0.8 + 0.1 * circle;
  srcColor = vec4(hsl2rgb(hsl), srcColor.w);
  dstColor = dstColor + srcColor;
}

void drawNoise(inout vec4 dstColor, in vec2 pos) {
  float n = rand(gl_FragCoord.xy + time);
  float t = fract(time * 0.2);

  // border decolation
  // float i = abs(fract((pos.y + t) * 8.0) - 0.5) + 0.3;
  // i = pow(i, 0.2);
  dstColor += (n * noize_intensity);
}

void createCoordinate(inout vec2 coordinate, inout vec2 coordinateByThread, inout vec2 oddThread) {
  float divider = meow_number;
  divider = max(1.0, divider);
  coordinate = vTextureCoord;
  coordinate *= divider;
  coordinate *= adjustScale;
  coordinate.x -= max((resolution.x - resolution.y) / 2.0 / resolution.x * adjustScale.x, 0.0);

  coordinateByThread.x = floor(coordinate.x) / (divider * adjustScale.x - 1.);
  coordinateByThread.y = floor(coordinate.y) / (divider * adjustScale.y - 1.);

  // single mode, special procedure. I'm so ashamed of myself. I can't do without IF.
  if (divider <= 1.1 && (coordinate.x > 1.0 || coordinate.x < 0.0)) {
    coordinate.x  = 0.0;
    coordinate.y  = 0.0;
  }

  // If odd thread, value is 1.0. 
  oddThread.x = step(1., mod(coordinate.y, 2.0));
  oddThread.y = step(1., mod(coordinate.x, 2.0));

  coordinate = fract(coordinate);
  
  float d; 
  if (divider <= 3.0) {
    d = 1.0;
  } else {
    d = distance((coordinateByThread* 2.0 - 1.0), vec2(0,0));
  }
  
  // rotation
  float theta =  (PI) * time * 0.5 * d * meow_rotation;
  coordinate = coordinate * 2.0 - 1.0;
  mat2 m1 = mat2(cos(theta),-sin(theta), sin(theta),cos(theta));
  coordinate = m1 * coordinate;
  coordinate = coordinate * 0.5 + 0.5;

  // // overflowing pixels is padded a left-top-pixcel.
  coordinate = max(vec2(0.0, 0.0), coordinate);
  coordinate = min(vec2(1.0, 1.0), coordinate);
}

void drawCat(inout vec4 color, in vec2 coordinate, in vec2 coordinateByThread, in vec2 oddThread) {
  vec2 textureScale = vec2(0.5, 0.5);
  // vec2 textureOffset = textureOffset(int(time * meow_animation + oddThread.y + oddThread.x), textureScale);
  vec2 textureOffset = textureOffset(drumCount + int(oddThread.y + oddThread.x), textureScale);

  vec4 tex = texture2D(tex01, coordinate * textureScale + textureOffset);
  // tex.xyz = (tex.xyz) * vec3(coordinate.xy * sin(time) * 0.5 + 0.5, 1.0);

  color = mix(color, tex, meowIntensity);
}

void main() {
  vec2 pos = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

  vec4 c;
  if (wave00.x >= 0) {
    c = vec4(wavec00.xyz, 1.0);
    drawSine(pos, c, color, wave00.y, wavec00.w);
  }

  if (wave01.x >= 0) {
    c = vec4(wavec01.xyz, 1.0);
    drawSine(pos, c, color, wave01.y, wavec01.w);
  }

  if (wave02.x >= 0) {
    c = vec4(wavec02.xyz, 1.0);
    drawSine(pos, c, color, wave02.y, wavec02.w);
  }

  if (wave03.x >= 0) {
    c = vec4(wavec03.xyz, 1.0);
    drawSine(pos, c, color, wave03.y, wavec03.w);
  }

  if (wave04.x >= 0) {
    c = vec4(wavec04.xyz, 1.0);
    drawSine(pos, c, color, wave04.y, wavec04.w);
  }

  if (wave05.x >= 0) {
    c = vec4(wavec05.xyz, 1.0);
    drawSine(pos, c, color, wave05.y, wavec05.w);
  }

  if (wave06.x >= 0) {
    c = vec4(wavec06.xyz, 1.0);
    drawSine(pos, c, color, wave06.y, wavec06.w);
  }

  if (wave07.x >= 0) {
    c = vec4(wavec07.xyz, 1.0);
    drawSine(pos, c, color, wave07.y, wavec07.w);
  }

  drawNoise(color, pos);

  // debug
  // drawSine(pos, vec4(1.0, 0, 1.0, 1.0), color, 120, 440.);

  vec2 coordinate, coordinateByThread, oddThread;
  createCoordinate(coordinate, coordinateByThread, oddThread);

  drawCat(color, coordinate, coordinateByThread, oddThread);
  
  gl_FragColor = color;
  
  // debug tool
  
  // gl_FragColor = vec4(coordinate, 0.0, 1.0);
  // gl_FragColor = vec4(coordinateByThread, 0.0, 1.0);
  // gl_FragColor = vec4(oddThread, 0.0, 1.0);
  // gl_FragColor = vec4(wavec00.xyz, 1.0);
}

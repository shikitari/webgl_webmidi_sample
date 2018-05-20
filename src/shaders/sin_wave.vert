precision mediump float;

attribute vec3 position;
attribute vec2 textureCoord;
attribute vec4 color;

uniform float time;
uniform vec2 resolution;

varying vec2 vTextureCoord;
varying vec4 vColor;

void main(void){
	vTextureCoord = textureCoord;
	vColor = color;
	gl_Position = vec4(position, 1.0);
}

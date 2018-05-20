attribute vec3 position;
attribute vec2 textureCoord;
attribute vec4 color;

varying vec2 vTextureCoord;
varying vec4 vColor;

void main(void){
	vTextureCoord = textureCoord;
	vColor = color;
	gl_Position = vec4(position, 1.0);
}

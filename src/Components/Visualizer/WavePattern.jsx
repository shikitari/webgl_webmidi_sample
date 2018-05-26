import React, { Component } from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { connect } from "react-redux"
import Note from '@c/Note'
import App from '@c/App'
import {rgb2hsl, hsl2rgb} from '@/utils'
import ImageSandbox from "@/Components/Visualizer/ImageSandbox";

@connect(store => ({
	active_notes: store.active_notes,
	controllers: store.controllers,
	canvas_size: store.canvas_size,
	canvas_style_size: store.canvas_style_size,
	aspectRatioGtOne: store.aspectRatioGtOne,
	adjustScale: store.adjustScale,
	texture_st: store.texture_st,
	drum_count: store.drum_count
}))
export default class WavePattern extends Component {
	constructor(props) {
		super(props);
		this.gl;
		this.uniform = [];
		this.startTime = (new Date().getTime());
		this.vert = require('@/shaders/sin_wave.vert');
		this.frag = require('@/shaders/sin_wave.frag');
		this.aspectRatioGtOne;
		this.uniformController = {};
        this.uniformTex = {};
		this.tex = null;
		this.activeLooper = true;
	}

	static PolyphonyMax = 8;
	static TextureDivider = 2;

    static vertices = [
        -1.0, 1.0, 0.0,
         1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0
    ];
    static indices = [
        0, 2, 1,
        1, 2, 3
    ];
    static textureCoord = [
		0.0, 0.0,  
		1.0, 0.0,  
		0.0, 1.0, 
		1.0, 1.0
	];
    static vertexColor = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 0.0, 1.0
    ];

	componentDidMount() {
		this.init();
		// this.looper();
	}

	async init() {
		var c = document.getElementById('canvasWegGl');
		this.gl = c.getContext('webgl')
		var gl = this.gl;

		await this.props.dispatch({type: "RESIZE", payload: {width: App.defaultVisualizerSize.width, height:App.defaultVisualizerSize.height}});

		gl.viewport(0, 0, this.props.canvas_size.width, this.props.canvas_size.height);

		// if use alpha blending, uncommentout.
		//gl.enable(gl.BLEND);
		//gl.blendFunc(gl.ONE, gl.ONE);
		//gl.blendColor(1.0, 1.0, 1.0, 0.5);
		//gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.CONSTANT_ALPHA, gl.CONSTANT_ALPHA);

		var program = this.initProgram(
			this.createShader(this.gl.VERTEX_SHADER, this.vert),
			this.createShader(this.gl.FRAGMENT_SHADER, this.frag)
		);

		this.uniform[0] = gl.getUniformLocation(program, 'time');
		this.uniform[1] = gl.getUniformLocation(program, 'resolution');
		this.uniform[2] = gl.getUniformLocation(program, 'aspectRatioGtOne');
		this.uniform[3] = gl.getUniformLocation(program, 'adjustScale');
		this.uniform[4] = gl.getUniformLocation(program, 'meowIntensity');
		this.uniform[5] = gl.getUniformLocation(program, 'drumCount');

        this.uniformTex["tex01"] = gl.getUniformLocation(program, 'tex01');
        this.uniformTex["tex01st"] = gl.getUniformLocation(program, 'tex01st');

		this.uniform[30] = gl.getUniformLocation(program, 'wave');
		this.uniform[31] = gl.getUniformLocation(program, 'wavec');


		let list = [];
		for (let i in this.props.controllers) {	
			let v = this.props.controllers[i];
			let label = v.label;
			let id = v.id;
			this.uniformController[label] = {uniform: gl.getUniformLocation(program, label), id};
		}

		let image;
		try {
			image = await this.loadTex("/images/cat_star512.png");	
		} catch (error) {
			console.log(error);
		}
		
		if (image) {
			gl.activeTexture(gl.TEXTURE0);
			this.tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.tex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);//unbind
			// console.log(gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
		}

        this.setAttribution(program);

		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		this.renderGl();
	}

	async looper() {
		while(this.activeLooper) {
			await this.delay(500);
			let time = this.now();
			let index = Math.floor(time * 2);
			let x = index % WavePattern.TextureDivider;
			let y = Math.floor(index / WavePattern.TextureDivider);
			
			let dividerInv = 1.0 / WavePattern.TextureDivider;
			this.props.dispatch({type: "CHANGE_TEXTURE_ST", payload: {w: 0.5, h:0.5, x:dividerInv * x, y:dividerInv * y}});
		}
	}

	initProgram(vert, frag) {
		var gl = this.gl;
		var program = gl.createProgram();
		gl.attachShader(program, vert);
		gl.attachShader(program, frag);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error("link shader error");
			return null;
		}

		gl.useProgram(program);
		return program;
	}

	createShader(shaderType, src) {//.gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
		var gl = this.gl;
		var shader;
		shader = gl.createShader(shaderType);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw new Error("create shader error");
			return null;
		}
		return shader;
	}

    setAttribution(program) {
        var gl = this.gl;

        // vertex
        var vertices = this.createBuffer(gl.ARRAY_BUFFER, Float32Array, WavePattern.vertices);
        this.setAttribLocation(program, 'position', vertices, 3);//x, y, z

        //uv coord
        var uv = this.createBuffer(gl.ARRAY_BUFFER, Float32Array, WavePattern.textureCoord);
        this.setAttribLocation(program, 'textureCoord', uv, 2);//x, y

        // // vertex color
        var colors = this.createBuffer(gl.ARRAY_BUFFER, Float32Array, WavePattern.vertexColor);
        this.setAttribLocation(program, 'color', colors, 4);//x, y, z, w

        // indices
        var indices = this.createBuffer(gl.ELEMENT_ARRAY_BUFFER, Int16Array, WavePattern.indices);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
    }

    setAttribLocation(program, attriId, buffer, stride) {
        let gl = this.gl;
        let attribLocation = gl.getAttribLocation(program, attriId);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(attribLocation);
        gl.vertexAttribPointer(attribLocation, stride, gl.FLOAT, false, 0, 0);
    }

	createBuffer(bufferType, dataInstantiateFunc, data) {
		var gl = this.gl;
		var b = gl.createBuffer();
		gl.bindBuffer(bufferType, b);
		gl.bufferData(bufferType, new dataInstantiateFunc(data), gl.STATIC_DRAW);
		gl.bindBuffer(bufferType, null);
		return b;
	}

    loadTex(source){
        return new Promise(function(resoleve, reject) {
            let img = new Image();
            img.onload = function(){
                resoleve(img);
			};
			img.onerror = function() {
				reject(new Error("image load error"));// return null
			};
            img.src = source;
        });
    }

	renderGl() {
		let gl = this.gl;

		let time = this.now();

		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.uniform1f(this.uniform[0], time);
		gl.uniform2fv(this.uniform[1], [this.props.canvas_size.width, this.props.canvas_size.height]);
		gl.uniform1f(this.uniform[2], this.props.aspectRatioGtOne);
		gl.uniform2fv(this.uniform[3], [this.props.adjustScale.x, this.props.adjustScale.y]);
		gl.uniform1i(this.uniform[5], parseInt(this.props.drum_count));
		
		for (let i in this.uniformController) {
			let id = this.uniformController[i]['id'];
			gl.uniform1f(this.uniformController[i]['uniform'], this.props.controllers[id].value);
		}

		this.uniformNoteValue(time);

        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.uniform1i(this.uniformTex["tex01"], 0);
		gl.uniform4fv(this.uniformTex["tex01st"], [
			this.props.texture_st.w, this.props.texture_st.h, 
			this.props.texture_st.x, this.props.texture_st.y]);

		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		gl.flush();

		//setTimeout(()=>{this.renderGl()}, 500);
		requestAnimationFrame(this.renderGl.bind(this));
	}

	delay(time) {
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                resolve();
            }, time)
        })
	}
	
	now() {
		return (new Date().getTime() - this.startTime) * 0.001;
	}

	uniformNoteValue(time) {
		let gl = this.gl;
		let notes = [];
		let drumNote = {velocity: 0};
		for (let i in this.props.active_notes) {
			let note = this.props.active_notes[i];
			if (note.channel === 9) {
				if (drumNote.velocity < note.velocity) {
					drumNote = note;//the largest value note
				}
			} else {
				notes.push(this.props.active_notes[i]);
			} 
		}		

		gl.uniform1f(this.uniform[4], drumNote.velocity / 127.0);

		//  sort by velocity. If It is heavy, should be commentout.
		notes.sort((a, b) => (b.velocity - a.velocity));

		const wave = new Int32Array(16);
		const waveColor = new Float32Array(32);
		for (let i = 0; i < WavePattern.PolyphonyMax; i++){			
			const indexStride2 = i * 2;
			const indexStride4 = i * 4;

			if (i < notes.length) {
				const info = notes[i].noteInfo();
				const noteNo = parseInt(notes[i].noteNo);
				const velocity = parseInt(notes[i].velocity);
				wave[indexStride2] = noteNo;
				wave[indexStride2 + 1] = velocity;
				waveColor[indexStride4] = info.rgb[0];
				waveColor[indexStride4 + 1] = info.rgb[1];
				waveColor[indexStride4 + 2] = info.rgb[2];
				waveColor[indexStride4 + 3] = info.freq;
			} else {
				wave[indexStride2] = -1;
				wave[indexStride2 + 1] = 0;
				waveColor[indexStride4] = 0;
				waveColor[indexStride4 + 1] = 0;
				waveColor[indexStride4 + 2] = 0;
				waveColor[indexStride4 + 3] = 0;
			}
		}
		
		gl.uniform2iv(this.uniform[30],　wave);
		gl.uniform4fv(this.uniform[31],　waveColor);
	}

	componentWillUpdate(nextProps, nextState) {
		if (nextProps.canvas_size.width !== this.props.canvas_size.width ||
			nextProps.canvas_size.height !== this.props.canvas_size.height) {
			if (this.gl) {
				this.gl.viewport(0, 0, nextProps.canvas_size.width, nextProps.canvas_size.height);
			}
		}
	}

	render() {
		const style = {
			backgroundColor: 'transparent',
			verticalAlign: 'bottom',
			width: this.props.canvas_style_size.width,
			height: this.props.canvas_style_size.height
		};

		return (
			<div>
				<canvas style={style} id="canvasWegGl"
				  width={this.props.canvas_size.width}
				  height={this.props.canvas_size.height}>
				  </canvas>
			</div>
		);
	}
}

import React, { Component } from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { connect } from "react-redux"
import Note from '@c/Note'
import {rgb2hsl, hsl2rgb} from '@/utils'

@connect(store => ({
	active_notes: store.active_notes,
	debugValues: store.debugValues,
    canvas_size: store.canvas_size,
    canvas_style_size: store.canvas_style_size,
    aspectRatioGtOne: store.aspectRatioGtOne,
    adjustScale: store.adjustScale
}))
export default class ImageSandbox extends Component {
	constructor(props) {
		super(props);
		this.gl;
		this.uniform = [];
		this.startTime = (new Date().getTime());
		this.vert = require('@/shaders/default.vert');
		this.frag = require('@/shaders/imagesandbox.frag');
		this.aspectRatio;
		this.uniformDebug = {};
		this.uniformTex = {};
		this.tex = null;
	}

	static PolyphonyMax = 8;

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
	}

	async init() {
		var c = document.getElementById('canvasWegGl');
		this.gl = c.getContext('webgl')
		var gl = this.gl;

		await this.props.dispatch({type: "RESIZE", payload: {width: 720, height:480}});

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
        this.uniformTex["tex01"] = gl.getUniformLocation(program, 'tex01');

		let list = [];
		for (let i in this.props.debugValues) {	
			let v = this.props.debugValues[i];
			let label = v.label;
			let id = v.id;
			this.uniformDebug[label] = {uniform: gl.getUniformLocation(program, label), id};
		}

        // let image = await this.loadTex("/images/512.png");
        let image = await this.loadTex("/images/cat_star512.png");
        gl.activeTexture(gl.TEXTURE0);
        this.tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);//unbind
        // console.log(gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));

        this.setAttribution(program);

		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		this.renderGl();
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
        var vertices = this.createBuffer(gl.ARRAY_BUFFER, Float32Array, ImageSandbox.vertices);
        this.setAttribLocation(program, 'position', vertices, 3);//x, y, z

        //uv coord
        var uv = this.createBuffer(gl.ARRAY_BUFFER, Float32Array, ImageSandbox.textureCoord);
        this.setAttribLocation(program, 'textureCoord', uv, 2);//x, y

        // // vertex color
        var colors = this.createBuffer(gl.ARRAY_BUFFER, Float32Array, ImageSandbox.vertexColor);
        this.setAttribLocation(program, 'color', colors, 4);//x, y, z, w

        // indices
        var indices = this.createBuffer(gl.ELEMENT_ARRAY_BUFFER, Int16Array, ImageSandbox.indices);
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
		let gl = this.gl;
		let b = gl.createBuffer();
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
            img.src = source;
        });
    }

	renderGl() {
		var gl = this.gl;

		var time = (new Date().getTime() - this.startTime) * 0.001;

		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.uniform1f(this.uniform[0], time);
		gl.uniform2fv(this.uniform[1], [this.props.canvas_size.width, this.props.canvas_size.height]);
		gl.uniform1f(this.uniform[2], this.props.aspectRatioGtOne);
		gl.uniform2fv(this.uniform[3], [this.props.adjustScale.x, this.props.adjustScale.y]);


		for (let i in this.uniformDebug) {
			let id = this.uniformDebug[i]['id'];
			gl.uniform1f(this.uniformDebug[i]['uniform'], this.props.debugValues[id].value);
		}

        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.uniform1i(this.uniformTex["tex01"], 0);

		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		gl.flush();

		requestAnimationFrame(this.renderGl.bind(this));
	}

	render() {
		const style = {
			backgroundColor: 'transparent',
			verticalAlign: 'bottom',
			width: this.props.canvas_style_size.width,
			height: this.props.canvas_style_size.height
		};

		if (this.gl) {
			this.gl.viewport(0, 0, this.props.canvas_size.width, this.props.canvas_size.height);
		}

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

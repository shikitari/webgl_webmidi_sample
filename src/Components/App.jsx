import React, { Component } from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { connect } from "react-redux"
import WavePattern from "@c/Visualizer/WavePattern"
import ImageSandbox from "@c/Visualizer/ImageSandbox"
import AudioManager from "@c/Audio/AudioManager"
import Panel1 from "@c/Contorollers/Panel1"

@connect(store => ({
	view_mode: store.view_mode
}))
export default class App extends Component {
	constructor(props) {
		super(props);
	}

	static defaultVisualizerSize = {
		width: 720,
		height: 480
	}

	componentDidMount() {
		document.addEventListener("keydown", e => this.onKeydown(e), false);
		window.addEventListener("resize", e => this.onResize(e));
		document.addEventListener("touchstart", e => this.handleStart(e), false);
	}

	onResize() {
		if (this.props.view_mode === 'full_screen') {
			this.fitFullScreen();
		}
	}

	handleStart(e) {
		if (e.touches.length >= 3) {
			this.switchViewMode();
		}
	}

	onKeydown(e) {
		if (e.keyCode === 71) {// G key
			this.switchViewMode();
		}
	}

	async switchViewMode() {
		let next = (this.props.view_mode === 'normal')? 'full_screen' : 'normal';
		await this.props.dispatch({type: "CHANGE_VIEW_MODE", payload: next});
		
		if (next === 'full_screen') {
			this.fitFullScreen();
		} else {
			this.props.dispatch({type: "RESIZE", payload: {width: App.defaultVisualizerSize.width, height:App.defaultVisualizerSize.height}});
		}
	}

	fitFullScreen() {
		let w = window.innerWidth
		|| document.documentElement.clientWidth
		|| document.body.clientWidth;

		let h = window.innerHeight
		|| document.documentElement.clientHeight
		|| document.body.clientHeight;

		this.props.dispatch({type: "RESIZE", payload: {width: w, height:h}});
	}

	render() {
		let style = {
			visibility: 'visible',
		};
		if (this.props.view_mode === "full_screen") style.visibility = "hidden";

		return (
			<div >
				<WavePattern />
				<Panel1 />
				<AudioManager />
			</div>
		);
	}
}


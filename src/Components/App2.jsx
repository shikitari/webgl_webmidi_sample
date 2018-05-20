import React, { Component } from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { connect } from "react-redux"
import ImageSandbox from "@c/Visualizer/ImageSandbox"
import AudioManager from "@c/Audio/AudioManager"
import PanelDebug from "@c/Contorollers/PanelDebug"

@connect(store => ({}))
export default class App extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
	}

	render() {
		return (
			<div>
				<ImageSandbox />
				<PanelDebug />
				<AudioManager />
			</div>
		);
	}
}


import React, { Component } from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { connect } from "react-redux"

export default class PartType1 extends Component {
	constructor(props) {
		super(props);
    }
    
    onChange(e, id) {
        this.props.callback(e, id);
    }

	render() {
		return (
			<div className="parttype1">
                <span className="label">{this.props.label}:</span>
                <input className="range" type="range" min={this.props.min} max={this.props.max} step={this.props.step} value={this.props.value} onChange={(e) => this.onChange(e, this.props.id)} />
                <input className="text" type="number" value={this.props.value} onChange={(e) => this.onChange(e, this.props.id)} />
			</div>
		);
	}
}


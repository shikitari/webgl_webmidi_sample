import React, { Component } from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { connect } from "react-redux"
import PartType1 from '@c/Contorollers/PartType1'

@connect(store => ({
	debugValues: store.debugValues,
 }))
export default class Panel1 extends Component {
	constructor(props) {
		super(props);
	}

	onChange(e, id) {
		this.props.dispatch({type: "DEBUG_CHANGE", payload: {id, value: e.target.value}});
		
	}

	render() {
		let list = [];
		for (let i in this.props.debugValues) {
			let v = this.props.debugValues[i];
			let item = <PartType1 key={v.id} label={v.label} callback={this.onChange.bind(this)}
			min={v.min} 
			max={v.max} 
			step={v.step} 
			value={v.value} 
			id={v.id} />
			list.push(item);
		}

		return (
			<div id="controllers">
				<h3>Controller</h3>
				<div>
					{list}
				</div>
			</div>
		);
	}
}


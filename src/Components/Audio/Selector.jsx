import React, { Component } from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { connect } from "react-redux"

@connect(store => ({ }))
export default class Selector extends Component {
	constructor(props) {
		super(props);
	}

	async change(e) {
		await this.props.dispatch({type: this.props.data.type, payload: e.target.value});
		this.props.data.change();
	}

	render() {		
		let list = [];
		let values =  [...this.props.data.items.values()];
		
		list.push(<option key="0" value="0">-</option>);
		for (let v of values) {	
			list.push(<option key={v.id} value={v.id}>{v.manufacturer} - {v.name}</option>);
		}
		
		return (
			<select value={this.props.data.selected} onChange={this.change.bind(this)}>
				{list}
			</select>
		);
	}
}


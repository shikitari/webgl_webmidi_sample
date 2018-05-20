import logger from 'redux-logger'
import {
	applyMiddleware,
	compose
} from 'redux';

//I'm apologize for "single reducer", "no action creator" and "ugly event name".
export function reducer(state = {}, {
	type,
	payload
}) {

	let r = state;
	let id;
	switch (type) {
		case 'UPDATE_MIDI_DIVICE':
			return {
				...state,
				midi_devices: payload
			};
		case 'SELECT_MIDI_INPUT':
			return {
				...state,
				midi_device_selected_input: payload
			};
		case 'SELECT_MIDI_OUTPUT':
			return {
				...state,
				midi_device_selected_output: payload
			};
		case 'COMPLETED_MIDI_ACCESS':
			return {
				...state,
				midi_access: payload
			};
		case 'COMPLETED_MIDI_INPUT':
			return {
				...state,
				midi_device_input: payload
			};
		case 'COMPLETED_MIDI_OUTPUT':
			return {
				...state,
				midi_device_output: payload
			};
		case 'RECEIVING_MIDI_MESSAGE_MONITOR':
			return {
				...state,
				midi_monitor_str: payload
			};
		case 'CONTROLLERS_CHANGE':
			id = payload["id"];
			r = {
				...state,
				controllers: {
					...state.controllers
				}
			}
			r['controllers'][id] = {
				...r['controllers'][id]
			};
			r['controllers'][id]['value'] = payload['value'];
			return r;
		case 'ACTIVE_NOTES_OVERWRITE':
			r = {
				...state,
				active_notes: {
					...state.active_notes
				}
			}
			r['active_notes'][payload["noteName"]] = payload;
			return r;

		case 'DEBUG_CHANGE':
			id = payload["id"];
			r = {
				...state,
				debugValues: {
					...state.debugValues
				}
			}
			r['debugValues'][id] = {
				...r['debugValues'][id]
			};
			r['debugValues'][id]['value'] = payload['value'];
			return r;
		case 'ACTIVE_NOTES_OVERWRITE':
			r = {
				...state,
				active_notes: {
					...state.active_notes
				}
			}
			r['active_notes'][payload["noteName"]] = payload;
			return r;

		case 'ACTIVE_NOTES_REPLACE_ALL':
			return {
				...state,
				active_notes: payload
			};
		case 'LOOP_BACK_CHANGE':
			return {
				...state,
				midi_loop_back: payload
			};
		case 'CHANGE_VIEW_MODE':
			return {
				...state,
				view_mode: payload
			};
		case 'RESIZE':
			r = {
				...state
			}
			r.canvas_size = payload;
			r.canvas_style_size = payload;
			let aspect = payload.width / payload.height;
			r.aspectRatioGtOne = (aspect > 1.0) ? aspect : 1.0 / aspect;
			r.adjustScale.x = 1.0;
			r.adjustScale.y = 1.0 / aspect;
			if (aspect > 1.0) {
				r.adjustScale.x = aspect;
				r.adjustScale.y = 1.0;
			}
			return r;
		case 'CHANGE_TEXTURE_ST':
			return {
				...state,
				texture_st: payload
			};
		case 'NOTE_DRUM':
			return {
				...state,
				drum_count: state.drum_count + payload
			};
	}
	return r;
}

export const initialState = {
	midi_access: null,
	midi_device_input: null,
	midi_device_output: null,
	midi_device_selected_input: "0",
	midi_device_selected_output: "0",
	midi_monitor_str: "-",
	view_mode: "normal",
	drum_count: 0,
	canvas_size: {
		width: 720,
		height: 480,
	},
	canvas_style_size: {
		width: 720,
		height: 480,
	},
	aspectRatioGtOne: 1,
	adjustScale: {
		x: 1,
		y: 1
	},
	texture_st: {
		w: 0.5,
		h: 0.5,
		x: 0,
		y: 0,
	},
	controllers: {
		v01: {
			id: "v01",
			label: "noize_intensity",
			value: 0.12,
			min: 0.0,
			max: 0.3,
			step: 0.01,
			midi_status: 0xb0,
			midi_channel: 0x00,
			midi_control: 0x05
		},
		v02: {
			id: "v02",
			label: "wave_speed",
			value: 1.0,
			min: 0.0,
			max: 4.0,
			step: 0.1,
			midi_status: 0xb0,
			midi_channel: 0x00,
			midi_control: 0x49
		},
		v03: {
			id: "v03",
			label: "freq_scale",
			value: 5.0,
			min: 1.0,
			max: 9.0,
			step: 0.1,
			midi_status: 0xb0,
			midi_channel: 0x00,
			midi_control: 0x4b
		},
		v04: {
			id: "v04",
			label: "amplitude_scale",
			value: 0.8,
			min: 0.1,
			max: 1.0,
			step: 0.01,
			midi_status: 0xb0,
			midi_channel: 0x00,
			midi_control: 0x48
		},
		v05: {
			id: "v05",
			label: "light_intensity",
			value: 0.8,
			min: 0.1,
			max: 1.0,
			step: 0.01,
			midi_status: 0xb0,
			midi_channel: 0x00,
			midi_control: 0x5d
		},
		v06: {
			id: "v06",
			label: "wave_expand",
			value: 1.0,
			min: 1.0,
			max: 4.0,
			step: 0.1,
			midi_status: 0xb0,
			midi_channel: 0x00,
			midi_control: 0x5b
		},
		v07: {
			id: "v07",
			label: "meow_number",
			value: 1.0,
			min: 1.0,
			max: 8.0,
			step: 0.1,
			midi_status: 0xb0,
			midi_channel: 0x00,
			midi_control: 0x00
		},
		v08: {
			id: "v08",
			label: "meow_rotation",
			value: 0.0,
			min: 0.0,
			max: 4.0,
			step: 0.1,
			midi_status: 0xb0,
			midi_channel: 0x00,
			midi_control: 0x20
		},
		v09: {
			id: "v09",
			label: "meow_animation",
			value: 1.0,
			min: 0.0,
			max: 5.0,
			step: 0.1,
			midi_status: 0xb0,
			midi_channel: 0x00,
			midi_control: 0x07
		},
	},
	debugValues: {
		v01: {
			id: "v01",
			label: "v01",
			value: 0.0,
			min: 0.0,
			max: 1.0,
			step: 0.1
		},
		v02: {
			id: "v02",
			label: "v02",
			value: 0.0,
			min: 0.0,
			max: 1.0,
			step: 0.1
		},
		v03: {
			id: "v03",
			label: "v03",
			value: 0.0,
			min: 0.0,
			max: 1.0,
			step: 0.1
		},
		v04: {
			id: "v04",
			label: "v04",
			value: 0.0,
			min: 0.0,
			max: 1.0,
			step: 0.1
		},
		v05: {
			id: "v05",
			label: "v05",
			value: 0.0,
			min: 0.0,
			max: 1.0,
			step: 0.1
		},
		v06: {
			id: "v06",
			label: "v06",
			value: 0.0,
			min: 0.0,
			max: 1.0,
			step: 0.1
		},
	},
	midi_loop_back: true,
	midi_monitor_str: "-",
	active_notes: {}
};

//use logger and redux devtool
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const middleware = composeEnhancers(applyMiddleware(logger))

//use only redux dev tool
// export const middleware = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
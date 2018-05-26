import React, { Component } from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { connect } from "react-redux"
import Selector from "@c/Audio/Selector"
import { initialState } from '@/store_modules'
import Note from '@c/Note'

@connect(store => ({
    midi_access: store.midi_access,
    midi_device_input: store.midi_device_input,
    midi_device_output: store.midi_device_output,
    midi_device_selected_input: store.midi_device_selected_input,
    midi_device_selected_output: store.midi_device_selected_output,
    midi_monitor_str: store.midi_monitor_str,
    active_notes: store.active_notes,
    midi_loop_back: store.midi_loop_back,
    controllers: store.controllers,
    view_mode: store.view_mode
}))
export default class AudioManager extends Component {
    constructor(props) {
        super(props);
        this.isMonitorAnimation = false;
        this.isLooper = false;
    }
    static duration = 1000;

    componentDidMount() {
        this.init();
    }

    async init() {
        let midiAccess = await navigator.requestMIDIAccess();
        
        await this.props.dispatch({ type: "COMPLETED_MIDI_ACCESS", payload: midiAccess });

        this.isLooper = true;
        this.looper();

        //for debug
        // this.autoConfigForDebug();
    }

    async looper() {
        while(this.isLooper) {
            await this.delay(16);//approximately 1 / 60 sec
            
            if (this.props.active_notes && typeof(this.props.active_notes) === 'object') {
                let active_notes = {};
                let diff = false;
                for (let key in this.props.active_notes) {
                    let o = this.props.active_notes[key];
                    let note = Object.assign( Object.create( Object.getPrototypeOf(o)), o);//clone clsss instance
                    note.tick();
                    
                    if (note.active) {
                        active_notes[note.noteName] = note;
                    }
                    diff = true;
                }
                if (diff) {
                    this.props.dispatch({type: 'ACTIVE_NOTES_REPLACE_ALL', payload: active_notes});
                }
            }
        }
    }

    onMidiMessage(e) {
        let d = e.data;
        if (!d) { return; }
        
        let noteInfo;
        let status = d[0] & 0xf0;
        let channel = d[0] & 0x0f;
        
        let makeNoteNmae = noteNumber => "n" + noteNumber;
        let tunnelingMidiMessage = () => {
            if (this.props.midi_loop_back && this.props.midi_device_output) {
                this.props.midi_device_output.send(d);
            }
        };
        
        switch (status) {
            case 0x90: {//note on
                let noteName = makeNoteNmae(d[1]);
                this.monitorAnimation();
                let key = parseInt(d[1] & 0x7F);
                let velocity = parseInt(d[2] & 0x7F);
                if (velocity === 0) {
                    this.noteOff(noteName);
                } else {
                    this.noteOn(noteName, key, velocity, AudioManager.duration, channel);
                    if (channel === 0x09) {
                        this.props.dispatch({type: 'NOTE_DRUM', payload: 1});
                    }
                }
                tunnelingMidiMessage();
                break;
            } 
            case 0x80: {//note off
                this.noteOff( makeNoteNmae(d[1]));
                tunnelingMidiMessage();
                break;
            }
            case 0xB0: {//filter CC message. prevent irregular message.
                for (let i in this.props.controllers) {
                    let v = this.props.controllers[i];
                    if (status === v.midi_status && channel === v.midi_channel && d[1] === v.midi_control) {
                        let value = parseFloat(d[2]) / 127.0;
                        value = value * (v.max - v.min) + v.min;
                        this.props.dispatch({type: "CONTROLLERS_CHANGE", payload: {id: v.id, value}});
                    }
                }
                break;
            }
        }
    }

    noteOn(noteName, noteNo, velocity, duration, channel) {
        let note = new Note();
        note.noteOn(noteName, noteNo, velocity, duration, channel);
        this.props.dispatch({type: 'ACTIVE_NOTES_OVERWRITE', payload: note});
    }

    noteOff(noteName) {
        if (!this.props.active_notes[noteName]) {
            return;
        }
        let o = this.props.active_notes[noteName];
        let note = Object.assign( Object.create( Object.getPrototypeOf(o)), o);
        note.noteOff();
        this.props.dispatch({type: 'ACTIVE_NOTES_OVERWRITE', payload: note});
    }

    async noteOnTest(e) {
        if (!this.props.midi_device_output) return;

        let now = window.performance.now();
        this.props.midi_device_output.send([0x90, 60, 100]);
        this.props.midi_device_output.send([0x80, 60, 64], now + 300.0);
        
        this.props.midi_device_output.send([0x90, 64, 100], now + 100.0);
        this.props.midi_device_output.send([0x80, 64, 64], now + 400.0);
        
        this.props.midi_device_output.send([0x90, 67, 100], now + 200.0);
        this.props.midi_device_output.send([0x80, 67, 64], now + 600.0);
    }

    async monitorAnimation() {
        if (this.isMonitorAnimation) return;

        this.isMonitorAnimation = true;
        for (let i = 0; i < 4; i++) {
            let s = (i % 2 === 0)? "*" : " ";
            this.props.dispatch({type: "RECEIVING_MIDI_MESSAGE_MONITOR", payload: s})
            await this.delay(50);
        }
        this.props.dispatch({type: "RECEIVING_MIDI_MESSAGE_MONITOR", payload: "-"})
        this.isMonitorAnimation = false;
    }

    async reloadMidiOutput() {
        if (!this.props.midi_access) return;
        if (this.props.midi_device_selected_output === initialState.midi_device_selected_output) {
            await this.props.dispatch({type: "COMPLETED_MIDI_OUTPUT", payload: null})
            return;
        }

        if (this.props.midi_device_output === null || this.props.midi_device_selected_output !== this.props.midi_device_output.id) {
            let output = this.props.midi_access.outputs.get(this.props.midi_device_selected_output);
            if (!output) {
                throw new Error("Output devices is not found.");
                return;
            }
            await this.props.dispatch({type: "COMPLETED_MIDI_OUTPUT", payload: output});
        }
    }

    async reloadMidiInput() {
        if (!this.props.midi_access) return;
        if (this.props.midi_device_selected_input === initialState.midi_device_selected_input) {
            if (this.props.midi_device_input) this.props.midi_device_input.onmidimessage = null;
            await this.props.dispatch({type: "COMPLETED_MIDI_INPUT", payload: null})
            return;
        }

        if (this.props.midi_device_input === null ||
         this.props.midi_device_selected_input !== this.props.midi_device_input.id) {
            if (this.props.midi_device_input) this.props.midi_device_input.onmidimessage = null;

            let input = this.props.midi_access.inputs.get(this.props.midi_device_selected_input);
            if (!input) {
                throw new Error("Input devices is not found.");
                return;
            }
            input.onmidimessage = this.onMidiMessage.bind(this);
            await this.props.dispatch({type: "COMPLETED_MIDI_INPUT", payload: input})
        }
    }

    async autoConfigForDebug() {
        var a = [];

        if (!this.props.midi_access) return;
        
        let output, outputId;
        // output = this.props.midi_access.outputs.values().next();
        // output = (output)? output.value : null;
        // outputId = output.id;
        outputId = '0';
        output = this.props.midi_access.outputs.get(outputId);
        if (output) {
            a.push(this.props.dispatch({ type: "SELECT_MIDI_OUTPUT", payload: outputId}));
            a.push(this.props.dispatch({type: "COMPLETED_MIDI_OUTPUT", payload: output}));
        }

        let input, inputId;
        // input = this.props.midi_access.inputs.values().next();
        // input = (input)? input.value : null;
        // inputId = input.id;
        inputId = '0';
        input = this.props.midi_access.inputs.get(inputId);

        if (input) {
            a.push(this.props.dispatch({ type: "SELECT_MIDI_INPUT", payload: inputId }));
            await this.props.dispatch({type: "COMPLETED_MIDI_INPUT", payload: input});
            this.props.midi_device_input.onmidimessage = this.onMidiMessage.bind(this);
        }
        await Promise.all(a);
    }

    async delay(time) {
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                resolve();
            }, time)
        })
    }

    loopbackToggle(e) {
        this.props.dispatch({type: "LOOP_BACK_CHANGE", payload: !this.props.midi_loop_back});
    }

    render() {
        if (!this.props.midi_access) {
            return (<div></div>);
        }

        let className = "";
        if (this.props.midi_monitor_str !== initialState.midi_monitor_str) {
            className = "red";
        }

        let dataForInput = { items: this.props.midi_access.inputs, 
            selected: this.props.midi_device_selected_input, 
            type: "SELECT_MIDI_INPUT",
            change: () => this.reloadMidiInput()};

        let dataForOutput = { items: this.props.midi_access.outputs, 
            selected: this.props.midi_device_selected_output, 
            type: "SELECT_MIDI_OUTPUT",
            change: () => this.reloadMidiOutput()};

        let loopbackToggle = this.props.midi_loop_back? (<span>on</span>) : (<span>off</span>);

        let style = {
			display: 'block',
		};
		if (this.props.view_mode === "full_screen") style.display = "none";
    
        // <button onClick={this.autoConfig.bind(this)}>Auto Config</button>
        // <button onClick={(e) => (this.isLooper = false)}>Stop</button>
        return (
            <div id="audio_config" style={style}>
                <h3>midi config</h3>
                
                <div className="flex_container">
                    <div className="label">input:</div>
                    <Selector data={dataForInput} />
                    <div className="monitor"><span className={className}>{this.props.midi_monitor_str}</span></div>
                </div>
                <div className="flex_container">
                    <div className="label">output:</div>
                    <Selector data={dataForOutput} />
                    <button onClick={this.noteOnTest.bind(this)}>Test</button>
                </div>
                <div className="">
                <span className="label">looping (If use loopback device, should check off.): </span> 
                <input type="checkbox" checked={this.props.midi_loop_back} onChange={e => this.loopbackToggle(e)} />
                </div>
            </div>
        );
    }
}

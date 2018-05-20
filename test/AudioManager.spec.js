import React, { Component} from 'react';
// import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { connect } from "react-redux"
import { createStore } from 'redux';
import {reducer, initialState, middleware} from '@/store_modules'
import AudioManager from "@c/Audio/AudioManager"

import Enzyme,  { mount, shallow, render, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// import ReactTestUtils from 'react-dom/test-utils'
// const wrapper = ReactTestUtils.renderIntoDocument(<AudioManager store={store} />)

const store = createStore(reducer, initialState);
configure({ adapter: new Adapter() });

describe('recived midi message',  () => {
  const d1M = initialState.controllers.v01.midi_status;
  const d1L = initialState.controllers.v01.midi_channel;
  const d2 = initialState.controllers.v01.midi_control;
  const ccB0 = new Uint8Array([d1M | d1L, d2, 0x7f]);
  const wrapper = shallow(<AudioManager store={store} />)

  it('control change', async () => {    
    const instance = wrapper.dive().instance();
    instance.onMidiMessage({data: ccB0});

    await instance.delay(30);

    const expectValue =  initialState.controllers.v01.max;
    const actualValue = (store.getState().controllers.v01.value);
    console.log("e:" + expectValue + " / a:" + actualValue);

    expect(expectValue).to.equal(actualValue);
  })
})

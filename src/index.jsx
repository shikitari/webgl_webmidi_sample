import React, { Component} from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { connect } from "react-redux"
import { createStore } from 'redux';
import {reducer, initialState, middleware} from './store_modules'
import App from './Components/App'
import App2 from './Components/App2'

import '@/scss/main.scss';

// debug mode
// const store = createStore(reducer, initialState, middleware);

const store = createStore(reducer, initialState);

render(<Provider store={store}><App /></Provider>, document.getElementById('app'));

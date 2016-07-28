import 'babel-polyfill'

import React from 'react'
import { render } from 'react-dom'

import { createStore } from 'reactorx'
import App from '../common/components/app'

import actions from '../common/actions/counter'

let initialState = window.__INITIAL_STATE__

let store = createStore(initialState, actions)

store.subscribe( store => {
	render(
		<App store={store} />,
		document.getElementById('mnt')

	)
})

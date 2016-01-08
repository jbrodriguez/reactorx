import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'reactorx'

import App from './components/app'
import Api from './lib/api'
import actions from './actions/reddit'

let initialState = {
	selectedReddit: 'reactjs',
	postsByReddit: {},
}

const api = new Api()

let store = createStore(initialState, actions, {api})

store.subscribe( store => {
	// console.log('current state: ', store.state)
	render(
		<App store={store} />,
		document.getElementById('mnt')

	)
})
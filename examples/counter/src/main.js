import React from 'react'
import { render } from 'react-dom'

import { createStore } from 'reactorx'
import App from './components/app'

import actions from './actions/counter'

let initialState = {
	counter: 0,
}

let store = createStore(initialState, actions)

store.subscribe( store => {
	console.log('store: ', store)
	render(
		<App store={store} />,
		document.getElementById('mnt')

	)
})


import 'babel-polyfill'

import React from 'react'
import { render } from 'react-dom'

import { createStore } from 'reactorx'
import App from './components/app'

import actions from './actions/todos'
import { SHOW_ALL } from './constants/filters'

import 'todomvc-app-css/index.css'

let initialState = {
	todos: [
		{id: 0, text: "Use reactorx", completed: false}
	],
	filter: SHOW_ALL,
}

let store = createStore(initialState, actions)

store.subscribe( store => {
	// console.log('current state: ', store.state)
	render(
		<App store={store} />,
		document.getElementById('mnt')

	)
})

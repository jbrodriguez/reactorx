import React, { Component } from 'react'

import Header from './header'
import MainSection from './mainSection'

// Note: Stateless/function components *will not* hot reload!
// react-transform *only* works on component classes.
//
// Since layouts rarely change, they are a good place to
// leverage React's new Statelesss Functions:
// https://facebook.github.io/react/docs/reusable-components.html#stateless-functions
//
// App is a pure function of it's props, so we can
// define it with a plain javascript function...
export default function App({store}) {
	let { actions, dispatch } = store

	return (
		<div>
			<Header addTodo={_addTodo.bind(null, actions, dispatch)} />
			<MainSection store={store} />
		</div>
	)
}

function _addTodo(actions, dispatch, text) {
	dispatch(actions.addTodo, text)
}


// export default class App extends Component {
// 	render() {
// 		return (
// 			<div>
// 				<header className="header">
// 					<h1>todos</h1>
// 					<TodoInput
// 						newTodo
// 						onSave={this.handleSave.bind(this)}
// 						placeholder="What needs to be done ?"
// 					/>
// 				</header>
// 			</div>
// 		)
// 	}

// 	handleSave(text) {
// 		let { state, actions, dispatch } = store

// 		if (text.length !=== 0) {
// 			dispatch(actions.addTodo, text)
// 		}
// 	}
// }

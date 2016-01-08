import React, { Component } from 'react'

// Note: Stateless/function components *will not* hot reload!
// react-transform *only* works on component classes.
//
// Since layouts rarely change, they are a good place to
// leverage React's new Statelesss Functions:
// https://facebook.github.io/react/docs/reusable-components.html#stateless-functions
//
// App is a pure function of it's props, so we can
// define it with a plain javascript function...
export default class App extends Component {
	render() {
		let { state, actions } = this.props.store

		return (
			<div>
				<div>Counter: {state.counter}</div>
				<button onClick={() => actions.increment(2)}>+2</button>
				<button onClick={() => actions.decrement(1)}>-</button>
			</div>
		)
	}
}
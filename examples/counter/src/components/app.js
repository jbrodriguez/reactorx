import React from 'react'

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
	let { state, actions, dispatch } = store

	return (
		<div>
			<div>Counter: {state.counter}</div>
			<button onClick={() => dispatch(actions.increment, 2)}>+2</button>
			<button onClick={() => dispatch(actions.decrement)}>-</button>
		</div>
	)
}
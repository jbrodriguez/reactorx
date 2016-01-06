module.exports = [
	{type: "increment", fn: _increment},
	{type: "decrement", fn: _decrement},
]

function _increment({state, actions, dispatch}, _, delta) {
	return {
		...state,
		counter: state.counter+delta
	}
}

function _decrement({state, actions, dispatch}) {
	return {
		...state,
		counter: state.counter-1
	}
}
module.exports = [
	{type: "increment", fn: increment},
	{type: "decrement", fn: decrement},
	{type: "clicked", fn: clicked}
]

function increment({state, actions}, delta) {
	actions.clicked(1, "hero")

	return {
		...state,
		counter: state.counter+delta
	}
}

function decrement({state, actions}) {
	actions.clicked(1, "zero")

	return {
		...state,
		counter: state.counter-1
	}
}

function clicked({state}, times, kind) {
	return {
		...state,
		clicked: state.clicked+times,
		flash: kind
	}
}
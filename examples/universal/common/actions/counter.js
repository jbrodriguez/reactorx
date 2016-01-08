module.exports = {
	increment: ({state, actions}, delta) => {
		return { 
			...state, 
			counter: state.counter+delta
		}
	},

	decrement: ({state, actions}) => {
		return { 
			...state,
			counter: state.counter-1
		}
	},
}
module.exports = [
	{type: "addTodo", fn: _addTodo},
	{type: "completeAll", fn: _completeAll},
	{type: "clearCompleted", fn: _clearCompleted},
	{type: "setFilter", fn: _setFilter},
	{type: "completeTodo", fn: _completeTodo},
	{type: "editTodo", fn: _editTodo},
]

function _addTodo({state, actions, dispatch}, _, text) {
	return {
		...state,
		todos: [
			 {
				id: state.todos.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
				completed: false,
				text,
			},
			...state.todos
		]
	}
}

function _completeAll({state, actions, dispatch}) {
	const areAllMarked = state.todos.every(todo => todo.completed)

	return {
		...state,
		todos: state.todos.map( todo => 
			Object.assign({}, todo, {completed: !areAllMarked})
		)
	}
}

function _clearCompleted({state, actions, dispatch}) {
	return {
		...state,
		todos: state.todos.filter( todo => todo.completed === false )
	}
}

function _setFilter({state, actions, dispatch}, _, filter) {
	return {
		...state,
		filter
	}
}

function _completeTodo({state, actions, dispatch}, _, id) {
	return {
		...state,
		todos: state.todos.map( todo => 
			todo.id === id ?
				Object.assign({}, todo, {completed: !todo.completed}) :
				todo
		)
	}
}

function _deleteTodo({state, actions, dispatch}, _, id) {
	return {
		...state,
		todos: state.todos.filter( todo => todo.id !== id )
	}
}

function _editTodo({state, actions, dispatch}, _, {id, text}) {
	return {
		...state,
		todos: state.todos.map( todo => 
			todo.id === id ?
				Object.assign({}, todo, {text}) :
				todo
		)
	}
}
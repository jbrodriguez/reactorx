module.exports = {
	addTodo,
	completeAll,
	clearCompleted,
	setFilter,
	completeTodo,
	deleteTodo,
	editTodo,
}

function addTodo({state, actions}, text) {
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

function completeAll({state, actions}) {
	const areAllMarked = state.todos.every(todo => todo.completed)

	return {
		...state,
		todos: state.todos.map( todo => 
			Object.assign({}, todo, {completed: !areAllMarked})
		)
	}
}

function clearCompleted({state, actions}) {
	return {
		...state,
		todos: state.todos.filter( todo => todo.completed === false )
	}
}

function setFilter({state, actions}, filter) {
	return {
		...state,
		filter
	}
}

function completeTodo({state, actions}, id) {
	return {
		...state,
		todos: state.todos.map( todo => 
			todo.id === id ?
				Object.assign({}, todo, {completed: !todo.completed}) :
				todo
		)
	}
}

function deleteTodo({state, actions}, id) {
	return {
		...state,
		todos: state.todos.filter( todo => todo.id !== id )
	}
}

function editTodo({state, actions}, id, text) {
	return {
		...state,
		todos: state.todos.map( todo => 
			todo.id === id ?
				Object.assign({}, todo, {text}) :
				todo
		)
	}
}

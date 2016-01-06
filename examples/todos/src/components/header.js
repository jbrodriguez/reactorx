import React, { Component } from 'react'

import TodoTextInput from './todoTextInput'

export default function Header({addTodo}) {
	return (
		<div>
			<header className="header">
				<h1>todos</h1>
				<TodoTextInput
					newTodo
					onSave={_handleSave.bind(null, addTodo)}
					placeholder="What needs to be done ?"
				/>
			</header>
		</div>
	)	
}

function _handleSave(addTodo, text) {
	if (text.length !== 0) {
		addTodo(text)
	}
}
import React, { Component } from 'react'
import classnames from 'classnames'

import TodoTextInput from './todoTextInput'

export default class TodoItem extends Component {
	constructor(props, context) {
		super(props, context)
		this.state = {
			editing: false
		}
	}

	render() {
		const { todo, completeTodo, deleteTodo } = this.props

		let element
		if (this.state.editing) {
			element = (
				<TodoTextInput
					text={todo.text}
					editing={this.state.editing}
					onSave={(text) => this.handleSave(todo.id, text)}
				/>
			)
		} else {
			element = (
				<div>
					<input
						className="toggle"
						type="checkbox"
						checked={todo.completed}
						onChange={() => completeTodo(todo.id)}
					/>
					<label onDoubleClick={this.handleDoubleClick.bind(this)}>
						{todo.text}
					</label>
					<button 
						className="destroy"
						onClick={() => deleteTodo(todo.id)}
					/>
				</div>
			)
		}

		return (
			<li className={classnames({
					completed: todo.completed,
					editing: this.state.editing
				})}
			>
				{ element }
			</li>
		)
	}

	handleSave(id, text) {
		const { deleteTodo, editTodo } = this.props

		if (text.length === 0) {
			deleteTodo(id)
		} else {
			editTodo(id, text)
		}

		this.setState({ editing: false })
	}

	handleDoubleClick() {
		this.setState({ editing: true })
	}
}
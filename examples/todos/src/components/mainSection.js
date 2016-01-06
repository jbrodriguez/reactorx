import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

import Footer from './footer'
import TodoItem from './todoItem'

import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/filters'

const TODO_FILTERS = {
	[SHOW_ALL]: () => true,
	[SHOW_ACTIVE]: todo => !todo.completed,
	[SHOW_COMPLETED]: todo => todo.completed
}

export default class MainSection extends Component {
	render() {
		let { state, actions } = this.props.store
		const { filter, todos } = state

		const filteredTodos = todos.filter(TODO_FILTERS[filter])
		const completedCount = todos.reduce( (count, todo) => 
			todo.completed ? count + 1 : count,
			0
		)

		return (
			<section className="main">
				{ this.renderToggleAll(completedCount) }

				<ul className="todo-list">
					{ filteredTodos.map( todo => 
						<TodoItem key={todo.id} todo={todo} {...actions} />
					) }
				</ul>

				{ this.renderFooter(completedCount) }
			</section>
		)
	}

	renderToggleAll(completedCount) {
		let { state, actions } = this.props.store

		if (state.todos.length <= 0) {
			return
		}

		return (
			<input
				className="toggle-all"
				type="checkbox"
				checked={completedCount === state.todos.length}
				onChange={() => actions.completeAll()}
			/>
		)
	}

	renderFooter(completedCount) {
		let { state, actions } = this.props.store
		const { filter, todos } = state

		const activeCount = todos.length - completedCount

		if (!todos.length) {
			return null
		}

		return (
			<Footer
				completedCount={completedCount}
				activeCount={activeCount}
				filter={filter}
				onClearCompleted={this.handleClearCompleted.bind(this)}
				onShow={this.handleShow.bind(this)}
			/>
		)
	}

	handleClearCompleted() {
		let { state, actions } = this.props.store

		const atLeastOneCompleted = state.todos.some(TODO_FILTERS[SHOW_COMPLETED])
		if (atLeastOneCompleted) {
			actions.clearCompleted()
		}
	}

	handleShow(filter) {
		let { setFilter } = this.props.store.actions
		setFilter(filter)
	}
}

MainSection.propTypes = {
	store: PropTypes.object.isRequired,
}
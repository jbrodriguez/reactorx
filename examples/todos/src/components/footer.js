import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/filters'

export default class Footer extends Component {
	render() {
		return (
			<footer className="footer">
				{ this.renderTodoCount() }

				<ul className="filters">
					{[SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED].map( filter => 
						<li key={filter}>
							{ this.renderFilterLink(filter) }
						</li>
					)}
				</ul>

				{ this.renderClearButton() }
			</footer>
		)
	}

	renderTodoCount() {
		const { activeCount } = this.props
		const itemWord = activeCount === 1 ? 'item' : 'items'

		return (
			<span className="todo-count">
				<strong>{activeCount || 'No'}</strong> { itemWord } left
			</span>
		)
	}

	renderFilterLink(filter) {
		const { filter: selectedFilter, onShow } = this.props

		return (
			<a 
				className={classnames({ selected: filter === selectedFilter })}
				style={{ cursor: 'pointer' }}
				onClick={() => onShow(filter)}
			>
				{ filter }
			</a>
		)
	}

	renderClearButton() {
		const { completedCount, onClearCompleted } = this.props
		if (completedCount <= 0) {
			return null
		}

		return (
			<button
				className="clear-completed"
				onClick={onClearCompleted}
			>
				Clear completed
			</button>
		)
	}
}
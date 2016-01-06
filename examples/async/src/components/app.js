import React, { Component } from 'react'
import Picker from './picker'
import Posts from './posts'

export default class App extends Component {
	componentDidMount() {
		const { state, actions } = this.props.store
		actions.fetchPosts(state.selectedReddit)
	}

	componentWillReceiveProps(nextProps) {
		const { state, actions } = this.props.store
		const nextReddit = nextProps.store.state.selectedReddit

		if (nextReddit !== state.selectedReddit) {
			actions.fetchPosts(nextReddit)
		}
	}

	render() {
		const { state, actions } = this.props.store

		const { posts, isFetching, lastUpdated } = state.postsByReddit[state.selectedReddit] || { isFetching: true, posts: [] }

		return (
			<div>
				<Picker
					value={state.selectedReddit}
					onChange={this.handleChange.bind(this)}
					options={['reactjs', 'frontend']}
				/>
				<p>
					{ lastUpdated && 
						<span>
							Last Updated at { new Date(lastUpdated).toLocaleTimeString() }
							{ ' ' }
						</span>
					}
					{ !isFetching &&
						<a href="#"
							onClick={this.handleRefreshClick.bind(this)}>
							Refresh
						</a>
					}
				</p>
				{ isFetching && posts.length === 0 &&
					<h2>Loading ...</h2>
				}
				{ !isFetching && posts.length === 0 &&
					<h2>Empty.</h2>
				}
				{ posts.length > 0 && 
					<div style={{ opacity: isFetching ? 0.5 : 1 }}>
						<Posts posts={posts} />
					</div>
				}
			</div>
		)
	}

	handleChange(nextReddit) {
		const { selectReddit } = this.props.store.actions
		selectReddit(nextReddit)
	}

	handleRefreshClick(e) {
		e.preventDefault()

		const { state, {invalidateReddit, fetchPosts} } = this.props.store

		invalidateReddit(state.selectedReddit)
		fetchPosts(state.selectedReddit)
	}
}
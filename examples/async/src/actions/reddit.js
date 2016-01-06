module.exports = {
	fetchPosts,
	postsFetched,
	invalidateReddit,
	selectReddit
}

// the bracket notation [reddit] is a computed property
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer
function fetchPosts({state, actions, opts: {api}}, reddit) {
	let posts = state.postsByReddit[reddit]

	if (_shouldFetchPosts(posts)) {
		api.fetchPosts(reddit)
			.then(json => actions.postsFetched(reddit, json))

		return {
			...state,
			postsByReddit: {
				...state.postsByReddit,
				[reddit]: Object.assign({}, posts, {
					isFetching: true, 
					didInvalidate: false, 
					posts: []
				})
			}
		}

	}

	return state
}

function _shouldFetchPosts(posts) {
	if (!posts) {
		return true
	}
	if (posts.isFetching) {
		return false
	}
	return posts.didInvalidate
}

function postsFetched({state}, reddit, items) {
	let posts = state.postsByReddit[reddit]

	return {
		...state,
		postsByReddit: {
			...state.postsByReddit,
			[reddit]: Object.assign({}, posts, {
				isFetching: false,
				didInvalidate: false,
				posts: items.data.children.map(child => child.data),
				lastUpdated: Date.now(),
			})
		}
	}
}

function invalidateReddit({state}, reddit) {
	let posts = state.postsByReddit[reddit]

	return {
		...state,
		postsByReddit: {
			...state.postsByReddit,
			[reddit]: Object.assign({}, posts, {
				didInvalidate: true
			})
		}
	}	
}

function selectReddit({state}, reddit) {
	return {
		...state,
		selectedReddit: reddit
	}
}
import 'babel-regenerator-runtime'
import csp from 'js-csp'

module.exports = {
	createStore,
	combineActions,
}

function createStore(initialState, actions, optionals = {}, capacity = 623) {
	if (!initialState || Object.keys(initialState).length === 0) {
		throw new Error('Initial state must be given to the store')
	}

	if (!actions || Object.keys(actions).length === 0) {
		throw new Error('Actions must be given to the store')
	}

	var currentState = initialState

	var actions = actions
	var proxy = {}

	Object.keys(actions).forEach( key => {
		proxy[key] = (...args) => dispatch(key, args)
	})

	actions["reactorxInit"] = _ => currentState

	var opts = optionals

	var callback = null
	var queue = csp.chan(capacity)

	function* reactor(queue) {
		for (;;) {
			const action = yield csp.take(queue)

			if (!actions[action.name]) continue

			// looks like the spread operator doesn't work on undefined or null
			const args = action.args || []

			currentState = actions[action.name]({state: currentState, actions: proxy, opts}, ...args)

			if (callback)
				callback({state: currentState, actions: proxy})
		}
	}

	function subscribe(cb) {
		callback = cb
		csp.go(reactor, [queue])
		dispatch("reactorxInit")
	}

	function dispatch(name, args) {
		csp.go(function* () {
			yield csp.put(queue, {name, args})
		})
	}

	return {
		subscribe,
		actions: proxy
	}
}

function combineActions(...actions) {
	return Object.assign({}, actions)
}
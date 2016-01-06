import 'babel-regenerator-runtime'
import csp from 'js-csp'

module.exports = {
	createStore,
}

function createStore(initialState, actions, optionals) {
	var currentState = initialState

	var actionFunc = {}
	var actionName = {}

	actions.forEach( action => {
		actionName[action.type] = (...args) => dispatch(action.type, args)
		actionFunc[action.type] = action.fn
	})

	actionName["reactorxInit"] = "reactorxInit"
	actionFunc["reactorxInit"] = _ => currentState

	var opts = optionals

	var callback = null
	var queue = csp.chan(623) // this should probably be received as an argument

	function* reactor(queue) {
		for (;;) {
			var action = yield csp.take(queue)

			if (!actionFunc[action.type]) continue

			currentState = actionFunc[action.type]({state: currentState, actions: actionName, opts}, ...action.args)

			if (callback)
				callback({state: currentState, actions: actionName})
		}
	}

	function subscribe(cb) {
		callback = cb
		csp.go(reactor, [queue])
		dispatch("reactorxInit")
		// callback({state: currentState, actions: actionName, dispatch})
	}

	function dispatch(type, args) {
		csp.go(function* () {
			yield csp.put(queue, {type, args})
		})
	}

	return {
		subscribe,
		dispatch,
		actions: actionName
	}
}
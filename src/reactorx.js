require('babel-regenerator-runtime')

import csp from 'js-csp'

// export {
// 	createStore,
// 	// loadActions,
// }

export function createStore(initialState, actions, optionals) {
	var currentState = initialState

	var actionFunc = {}
	var actionName = {}

	actions.forEach( action => {
		actionName[action.type] = action.type
		actionFunc[action.type] = action.fn
	})

	actionName["reactorxInit"] = "reactorxInit"
	actionFunc["reactorxInit"] = _ => currentState

	var callback = null

	var queue = csp.chan(623)

	var optionals = optionals

	function* reactor(queue) {
		for (;;) {
			var action = yield csp.take(queue)

			if (!actionFunc[action.type]) continue

			currentState = actionFunc[action.type]({state: currentState, actions: actionName, dispatch},  optionals, action.params)
			callback({state: currentState, actions: actionName, dispatch})
		}
	}

	function subscribe(cb) {
		callback = cb
		csp.go(reactor, [queue])
		dispatch("reactorxInit")
		// callback({state: currentState, actions: actionName, dispatch})
	}

	function dispatch(type, params) {
		csp.go(function* () {
			yield csp.put(queue, {type, params})
		})
	}

	return {
		subscribe,
		dispatch,
		actions: actionName
	}
}

// function loadActions(folder) {
// 	var actionModules = require.context('./actions/', true, /\.js$/)

// 	let actions = []

// 	console.log("keys: ", actionModules.keys())

// 	actionModules.keys().forEach( module => {
// 		console.log('module: ', module)
// 		let normal = require("path").join("./actions/", __dirname, module)
// 		console.log('normal: ', normal)
// 		let testing = './actions/actions'
// 		let resolved = actionModules.resolve(module)
// 		console.log('resolved: ', resolved)
// 		actions = actions.concat(resolved)
// 	})

// 	return actions

// 	// var fs = require('fs')
// 	// let normalizedPath = require("path").join(__dirname, folder);

// 	// let actions = []

// 	// console.log('fs: ', fs)
// 	// console.log('normalizedPath: ', normalizedPath)

// 	// fs.readdirSync(normalizedPath).forEach(function(file) {
// 	// 	actions = actions.concat(require(folder + file))
// 	// })

// 	// return actions
// }

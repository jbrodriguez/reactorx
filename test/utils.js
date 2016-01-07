export function subscribe(dispatcher, steps = []) {
	return {step, exec}

	function step(fn) {
		return subscribe(dispatcher, [...steps, fn])
	}

	function exec() {
		return dispatcher.subscribe(store => {
			if (steps.length === 0) {
				throw new Error("No more steps expected but got " + JSON.stringify(store, null, 2))
			}

			const step = steps[0]
			steps.splice(0, 1)
			defer(() => step(store))
		})
	}
}

export function defer(fn) {
	setTimeout(fn, 0)
}

export function delay(ms, fn) {
	setTimeout(fn, ms)
}
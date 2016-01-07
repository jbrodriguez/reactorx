import { expect } from 'chai'
import { createStore } from '../src/reactorx'
import { subscribe } from './utils'

let initialState = {
	counter: 3
}

let actions = {
	increment: ({state, actions}, delta) => {
		return { 
			...state, 
			counter: state.counter+delta
		}
	},

	decrement: ({state, actions}) => {
		return { 
			...state,
			counter: state.counter-1
		}
	},
}

describe('createStore', () => {
	it('throws an exception if initial state is empty or not given', () => {
		expect(() => createStore()).to.throw(Error)
		expect(() => createStore({})).to.throw(Error)
	})

	it('throws an exception if actions is empty or not given', () => {
		expect(() => createStore(initialState)).to.throw(Error)
		expect(() => createStore(initialState, {})).to.throw(Error)
	})

	it('uses the initial state and actions', () => {
		const store = createStore(initialState, actions)
		store.subscribe( ({state}) => {
			expect(state).to.deep.equal({counter: 3})
		})
	})

	it('throws an error for unknown actions', () => {
		const store = createStore(initialState, actions)
		store.subscribe( ({actions}) => {
			expect(actions.unknown()).to.throw(Error)
		})
	})

	it('applies the action to the previous state', done => {
		subscribe(createStore(initialState, actions))
			.step(({state, actions}) => {
				expect(state).to.deep.equal({counter: 3})
				actions.increment(2)
			})
			.step(({state}) => {
				expect(state).to.deep.equal({counter: 5})
				done()
			})
			.exec()
	})

	it('exposes the public API', () => {
		const store = createStore(initialState, actions)
		const methods = Object.keys(store)

		expect(methods.length).to.equal(2)
		expect(methods).to.include('subscribe')
		expect(methods).to.include('actions')
	})
})
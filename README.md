reactorx
========

**reactorx** is a simple, small and pragmatic [Flux](https://facebook.github.io/flux/) implementation.

## Features
- Simple: One store with a state (plain javascript object) that is mutated only by actions (plain javascript functions) you define.
- Small: Under 65 LOC.
- Pragmatic: Very practical and terse. No boilerplate.
- Isomorphic and works with react-native.)

## Usage

Let's recreate the counter demo  with **reactorx**

```
import React from 'react'
import { render } from 'react-dom'

import { createStore } from 'reactorx'

let initialState = {
    counter: 0,
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

// Let's leverage React's Statelesss Functions:
// https://facebook.github.io/react/docs/reusable-components.html#stateless-functions
function App({store}) {
    let { state, actions } = store

    return (
        <div>
            <div>Counter: {state.counter}</div>
            <button onClick={() => actions.increment(2)}>+2</button>
            <button onClick={() => actions.decrement()}>-</button>
        </div>
    )
}


let store = createStore(initialState, actions)

store.subscribe( store => {
    render(
        <App store={store} />,
        document.getElementById('mnt')
    )
})
```

## Installation
**reactorx** has two dependencies, install them as well

```
npm install --save reactorx js-csp babel-regenerator-runtime
```

## API
`reactorx` is designed with ES6 in mind. As such, use a transpiler as appropriate.

The examples contained in the repo provide a hot-reloadable dev environment based on Webpack and Babel 6.

`createStore`
```
@param {object} state - Object tree with the initial state of the store
@param {object} actions - Object with methods that represent actions
@param {object} optionals (defaults to {})- This parameter will be sent to each action as an additional argument
@param {integer} capacity (defaults to 623) - Buffer size of the underlying dispatch queue
@return {object} - Returns the store, composed of a subscribe function and an actions property
```
The store returned by createStore has the following responsibilities:
- Holds application state
- Registers a callback via `subscribe(callback)`
- Allows state to be mutated via a collection of `actions` (actions property)

The callback function receives the current state of the store and all the actions that are available to be invoked to mutate this state

Each function that defines an action must have the following signature:
`action({state, actions, opts}, ...args)`
This action ***must*** return a new state.

This new state can be the same as the previous (just return state) or a new state object with changes.

***Do not*** modify the state object you receive in the action. Always return a new object.

To interact with the store, you would do the following:

```
// Define an plain object tree as the state of your application
let initialState = { counter: 0 }

// Define an object with methods that serve as actions 
let actions = {
    increment: ({state}, delta) => return state.counter+delta
    decrement: ({state}) => return state.counter-1 
}

// Create the store
let store = createStore(initialState, actions)

// Define a callback and subscribe it to receive changes to the state
store.subscribe( store => {
    console.log('state: ' , store.state)
})

// Dispatch actions using only the arguments required by your business logic.
// reactorx adds the {state, actions, opts} argument automatically upon invocation of your action handler
store.actions.increment(1)
# state: 1

store.actions.increment(5)
# state: 6

store.actions.decrement()
# state: 5

```

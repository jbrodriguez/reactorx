reactorx
========

`reactorx` is a simple, small and pragmatic [Flux](https://facebook.github.io/flux/) implementation.

## Features
- Simple: One store with a state (plain javascript object) that is mutated only by actions (plain javascript functions) you define.
- Small: Under 65 LOC.
- Pragmatic: Very practical and terse. No boilerplate.
- Isomorphic and works with react-native.

## Usage

Let's recreate the counter example

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


### createStore
`createStore(initialState, actions, optionals = {}, capacity = 623)`
```
@param {object} state - Object tree with the initial state of the store
@param {object} actions - Object with methods that represent actions
@param {object} optionals (defaults to {})- This parameter will be sent to each action as an additional argument
@param {integer} capacity (defaults to 623) - Buffer size of the underlying dispatch queue
@return {object} - Returns the store, composed of a subscribe function and an actions property
```
The store returned by createStore has the following responsibilities:
- Holds application state

- Registers a callback to notify changes via `subscribe(callback)`

- Allows state to be mutated via a collection of `actions`

The callback function receives the current state of the store and all the actions that can be invoked to mutate this state
```
function callback({state, actions}) {
    console.log('state: ', state)
}
store.subscribe(callback)
```

### actions
Each action must have the following signature:
`action({state, actions, opts}, ...args)`

Actions are defined as methods of an object.

```
const actions = {
    addTodo: ({state, actions, opts}, text) => {
        return {
            ...state,
            todos: [
                 {
                    id: state.todos.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
                    completed: false,
                    text,
                },
                ...state.todos
            ]
        }
    }
}
```

Each method ***must*** return a state.

This state can be the same as the previous (just return state) or a new state object with changes.


***Do not*** modify the state object you receive in the action. Always return a new object.


You can perform any operation within the action, such as
- Mutate state by creating a new state object with some properties changed

A common pattern would be
```
return {
        ...state,
        changedProperty: newValue
}
```

- Dispatch other actions
```
const actions = {
    fetchPosts: ({state, actions, opts: {api}}, reddit}) => {
        api.fetchPosts(reddit)
            .then(json => actions.postsFetched(reddit, json))

        return state
    },

    postsFetched: ({state}, reddit, items}) => {
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
}
```


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

## License
MIT

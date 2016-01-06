reactorx
========

**reactorx** is a simple, small and efficient [Flux](https://facebook.github.io/flux/) implementation.

## Features
- Simple: A single store, with a state that is only mutated by actions you define
- Small: Under 60 LOC
- Efficient: 

## Usage

Let's recreate to counter app with **reactorx**

```
import React from 'react'
import { render } from 'react-dom'

import { createStore } from 'reactorx'

let initialState = {
    counter: 0,
}

let actions  = [
    {type: "increment", fn: _increment},
    {type: "decrement", fn: _decrement},
]

function _increment({state, actions, dispatch}, _, delta) {
    return {
        ...state,
        counter: state.counter+delta
    }
}

function _decrement({state, actions, dispatch}, _, delta) {
    return {
        ...state,
        counter: state.counter-delta
    }
}

// Let's leverage React's Statelesss Functions:
// https://facebook.github.io/react/docs/reusable-components.html#stateless-functions
function App({store}) {
    let { state, actions, dispatch } = store

    return (
        <div>
            <div>Counter: {state.counter}</div>
            <button onClick={() => dispatch(actions.increment, 2)}>+2</button>
            <button onClick={() => dispatch(actions.decrement, 1)}>-</button>
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


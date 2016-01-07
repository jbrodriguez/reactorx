reactorx
========

**reactorx** is a simple, small and pragmatic [Flux](https://facebook.github.io/flux/) implementation.

## Features
- Simple: One store with a state (plain javascript object) that is mutated only by actions (plain javascript functions) you define.
- Small: Under 65 LOC.
- Pragmatic: Very practical and terse. No boilerplate.
- Isomorphic and works with react-native.

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


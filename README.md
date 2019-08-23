# React Blockstack

Use Blockstack with React, avoiding many of the pitfalls.

Handles Blockstack authentication and provides a
`useBlockstack` React hook and an optional
[React context object](https://reactjs.org/docs/context.html)
that pass these properties to components:

* `userSession` (Blockstack interface)
* `userData` (when authenticated)
* `signIn` (null when logged in or pending)
* `signOut` (null when not logged in or pending)
* `person` (if authenticated, a Person instance containing the user profile)

## Live Demo

The [example](https://github.com/njordhov/react-blockstack/tree/master/example)
in the source repository is a reimplementation of the
[Blockstack react template](https://github.com/blockstack/blockstack-app-generator/tree/master/react/templates).

It demonstrates different ways of using Blockstack Context in place of hairy
code to deal with the mutable Blockstack api in react.
Feel free to use the example as a starting point for your own projects.

Live at:
[![Netlify Status](https://api.netlify.com/api/v1/badges/4c1f3c5b-c184-4659-935a-c66065978127/deploy-status)](https://react-blockstack.netlify.com)

## Installation

    npm install react-blockstack

## Setup

Execute as early as possible to start the Blockstack authentication.

````javascript
import { initBlockstack } from 'react-blockstack'

initBlockstack()
````

Optional argument: Blockstack AppConfig.

## React Hook for Function Components

The package provides a `useBlockStack` React hook for use in function components.
It provides access to the Blockstack SDK while implicitly handling the authentication:

    const {userSession, userData, signIn, signOut, person} = useBlockstack()

### Example

Here is a react function component that implements an authentication button
that handles both signin and logout, adapting the label depending on status and
is disabled while authentication is pending.

````javascript
import { useBlockstack } from 'react-blockstack'

function Auth () {
    const { signIn, signOut } = useBlockstack()
    return (
        <button disabled={ !signIn && !signOut }
                onClick={ signIn || signOut }>
            { signIn ? "Sign In" : signOut ? "Sign Out" : "Pending" }
        </button>
    )
}
````

To include the button in jsx:

    <Auth />

## React Class Components

React hooks like `useBlockstack` can only be used inside function components.
For conventional React class components, enclose elements in a shared Blockstack context:

    ReactDOM.render(<Blockstack><App /></Blockstack>,
                    document.getElementById('app-root'))

The context will be implicitly passed through the component tree and can be
used as any other React context.

The App component below will automatically be updated whenever there is a
change to the context.
Note the use of the `this.context` containing the properties and
that the class is required to have `contextType = BlockstackContext`.

````javascript
import BlockstackContext from 'react-blockstack'

export default class App extends Component {
  render() {
    const { person } = this.context
    const avatarUrl = person && person.avatarUrl && person.avatarUrl()
    const personName = person && person.name && person.name()
    return(
      <div>
        <img hidden={ !avatarUrl } src={ avatarUrl } />
        { personName }
        <Auth />
      </div>
    )
  }
}
App.contextType = BlockstackContext
````

If there are multiple Blockstack elements they will all share the same context.

# React Blockstack

Simplifies using Blockstack with React and eliminates many of the pitfalls.

## Example

The [example](https://github.com/njordhov/react-blockstack/example/)
in the source repository is a reimplementation of the
[Blockstack react template](https://github.com/blockstack/blockstack-app-generator).
It demonstrates different ways of using Blockstack Context in place of hairy
code to deal with the mutable Blockstack api in react. As you can see,
the example is substantially simplified compared to the original template.
Feel free to use the example as a starting point for your own projects.

## Installation

    npm install react-blockstack

## Blockstack Context

This component handles Blockstack authentication and provides a
[React context object](https://reactjs.org/docs/context.html)
that pass these properties through the component tree:

* `userSession` (mutable Blockstack interface)
* `userData` (Blockstack SDK when authenticated)
* `person` (if authenticated, a Person instance containing the user profile)
* `handleSignin` (null when logged in or pending)
* `handleSignout` (null when not logged in or pending)

## Setup

Execute as early as possible to start the Blockstack authentication of the user.

````javascript
import { initBlockstackContext } from 'react-blockstack'

initBlockstackContext()
````

Optionally call with a Blockstack AppConfig.

## Using React Hook

Here is a react function component that implements an authentication button
that handles both signin and logout, adapting the label depending on status and
is disabled while authentication is pending.

````javascript
import { useBlockstackContext } from 'react-blockstack'

function Auth () {
    const { handleSignIn, handleSignOut } = useBlockstackContext()
    return (
        <button disabled={ !handleSignIn && !handleSignOut }
                onClick={ handleSignIn || handleSignOut }>
            { handleSignIn ? "Sign In" : handleSignOut ? "Sign Out" : "Pending" }
        </button>
    )
}
````

To include the button in jsx:

    <Auth />

## Blockstack Context

Enclose elements in a shared Blockstack context:

    ReactDOM.render(<Blockstack><App /></Blockstack>,
                    document.getElementById('app-root'))

The context will be implicitly passed through the component tree.

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

# React Blockstack Context

React context for the Blockstack SDK.

## Example

https://github.com/njordhov/react-blockstack-context/example/

## Installation

    npm install react-blockstack-context

## Blockstack Context

This component handles Blockstack authentication and provides a
[React context object](https://reactjs.org/docs/context.html)
that the pass these properties through the component tree:

* userSession (mutable Blockstack interface)
* userData (Blockstack SDK when authenticated)
* person (a Person instance with the user profile)
* handleSignin (null when logged in or pending)
* handleSignout (null when not logged in or pending)

## Setup

````javascript
import { initBlockstackContext } from 'react-blockstack-context'

initBlockstackContext()
````

Optionally call with a Blockstack AppConfig.

## Using React Hook

````javascript
import { useBlockstackContext } from 'react-blockstack-context'

function Auth () {
    const { handleSignIn, handleSignOut } = useBlockstackContext()
    return (
        <button disabled={ !handleSignIn && !handleSignOut }
                onClick={ handleSignIn || handleSignOut }>
            { handleSignIn ? "Sign In" : handleSignOut ? "Sign Out" : "" }
        </button>
    )
}
````

Then jsx:

    <Auth />

## Using Context Element

Enclose one (or more) elements in a shared Blockstack context:

````javascript
import { Blockstack } from 'react-blockstack-context'

ReactDOM.render(<Blockstack><App /></Blockstack>,
                document.getElementById('app-root'))

export default class App extends Component {
  render() {
    const { userSession, userData, person } = this.context
    const avatarUrl = person && person.avatarUrl && person.avatarUrl()
    const personName = person && person.name && person.name()
    return(
      <div>
        <img hidden={!avatarUrl} src={ avatarUrl } />
        { personName }
        <button disabled={ !handleSignIn && !handleSignOut }
                onClick={ handleSignIn || handleSignOut }>
            { handleSignIn ? "Sign In" : handleSignOut ? "Sign Out" : "" }
        </button>
      </div>
    )
  }
}

App.contextType = BlockstackContext
````

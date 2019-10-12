# React Blockstack

Use the Blockstack SDK with React.

Handles Blockstack authentication and provides a
`useBlockstack` React hook and an optional
[React context object](https://reactjs.org/docs/context.html)
that pass these properties to components:

* `userSession` (Blockstack interface)
* `userData` (A UserData object from the Blockstack SDK; `null` unless authenticated)
* `signIn` (function to sign in the user; `null` when logged in or pending)
* `signOut` (function to sign out the user; `null` when not logged in or pending)
* `person` (if authenticated, a Person instance containing the user profile)

## Installation

    npm install react-blockstack

## Blockstack Authentication

Execute as early as possible to initialize the Blockstack SDK and eventually authenticate the user:

````javascript
import ReactBlockstack from 'react-blockstack'

const { userSession } = ReactBlockstack()
````

Consider placing in the top level index.js file of your project. For customization of the authentication, use the same options argument as [UserSession](https://blockstack.github.io/blockstack.js/classes/usersession.html) in the Blockstack SDK:

````javascript
import { AppConfig } from 'blockstack'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const { userSession } = ReactBlockstack({appConfig})
````

Note that it is typically preferable to get `userSession` from the `useBlockstack` hook,
ignoring the return value from `ReactBlockstack`.

## React Hook for Function Components

The package provides a `useBlockStack` React hook for use in function components. It provides access to the Blockstack SDK and eventually an authenticated user:

    const {userSession, userData, signIn, signOut, person} = useBlockstack()

Only `userSession` and `signIn` are available before authentication.
After authentication, `signIn` is null, but there are bindings for
`userData`, `signOut` and `person`.

### Example

Here is a react function component that implements an authentication button.
It handles both signin and logout, adapting the label depending on status, changing appearance to disabled while authentication is pending:

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

For conventional React class components, enclose elements in a shared Blockstack context:

````javascript
import { Blockstack } from 'react-blockstack/dist/context'

ReactDOM.render(<Blockstack><App/></Blockstack>, document.getElementById('app-root'))
````

The Blockstack SDK properties are implicitly passed through the component tree and can be used as any other React context.

### Example

The App component below will automatically be updated whenever there is a change in the Blockstack status.
Note the use of the `this.context` containing the properties and
that the class is required to have `contextType = BlockstackContext`.

````javascript
import BlockstackContext from 'react-blockstack/dist/context'

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

## Live Demo

The [example](https://github.com/njordhov/react-blockstack/tree/master/example)
in the source repository is a reimplementation of the
[Blockstack react template](https://github.com/blockstack/blockstack-app-generator/tree/master/react/templates).

It demonstrates different ways of using react-blockStack.
You are encouraged to use the example as a starting point for your own projects.

Live at:
[![Netlify Status](https://api.netlify.com/api/v1/badges/4c1f3c5b-c184-4659-935a-c66065978127/deploy-status)](https://react-blockstack.netlify.com)

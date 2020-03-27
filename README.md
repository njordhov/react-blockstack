# React Blockstack

React hooks to use the [Blockstack SDK](https://blockstack.github.io/blockstack.js/)
with [react function components](https://reactjs.org/docs/components-and-props.html).

Includes backward compatibility with react class components.

## Installation

    npm install react-blockstack

## Blockstack Authentication

Execute as early as possible to initialize the Blockstack SDK and user authentication:

````javascript
import ReactBlockstack from 'react-blockstack'

const blockstack = ReactBlockstack()
````

Consider placing this code in the main index.js file of your project. For customization of the authentication, use the same options argument as for [UserSession](https://blockstack.github.io/blockstack.js/classes/usersession.html) in the Blockstack SDK:

````javascript
import { AppConfig } from 'blockstack'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const blockstack = ReactBlockstack({appConfig})
````

The `blockstack.userSession` property is available in case you need to access to the blockstack SDK on toplevel. It is typically preferable to get `userSession` from the `useBlockstack` hook, ignoring the return value from `ReactBlockstack`.

## React Hook for Function Components

The package provides a `useBlockStack` React hook for use in function components. It provides access to the Blockstack SDK and eventually an authenticated user:

    const {userSession, userData, signIn, signOut, person} = useBlockstack()

The hook returns these properties:

* `userSession` (UserSession interface for the Blockstack SDK)
* `userData` (UserData interface from the Blockstack SDK; `null` unless authenticated)
* `authenticated` (true when authentication is complete)
* `signIn` (function to sign in the user; `null` when already logged in or pending authentication)
* `signOut` (function to sign out the user; `null` when not logged in or pending authentication)
* `person` (if authenticated, a Person instance containing the user profile)

Only `userSession` and `signIn` are available before authentication.
After authentication, `signIn` is null, but there are bindings for
`userData`, `authenticated`, `signOut` and `person`. This can be used for conditional rendering
depending on the authentication status. Note that the user can neither sign in nor sign out when the authentication is pending, so:

```javascript
const pendingAuthentication = !signIn && !signOut
```

### Example: Authentication Button

Here is a react function component that implements an authentication button.
It handles both signin and logout, adapting the label depending on status,
disabling the button while authentication is pending:

````javascript
import { useBlockstack } from 'react-blockstack'

function Auth () {
    const { signIn, signOut } = useBlockstack()
    return (
        <button disabled={ !signIn && !signOut }
                onClick={ signIn || signOut }>
            { signIn ? "Sign In" : signOut ? "Sign Out" : "..." }
        </button>
    )
}
````

To include the button in jsx:

    <Auth />

## Persistent Data Storage

The `useFile(path: string)` hook is used to access the app's data store, covering
the functionality of `getFile`, `putFile` and `deleteFile` in the Blockstack SDK.

The argument is a pathname in the app's data store. The file does not have to exists before the call.

The `useFile` hook returns the content of the file like `getFile`, with a function to change the file content as second value. The returned content is `undefined` until the file has been accessed and `null` if the file is determined not to exist. The setter accepts the same content types as `putFile`, and will delete the file if called with `null`. The content returned by `useFile` is conservatively updated, not reflecting the change until after storing the content is completed.

### Example

```javascript
const [content, setContent] = useFile("content")
```

## React Class Components

For conventional React class components, the package provides an optional
[React context object](https://reactjs.org/docs/context.html)
that pass properties from `useBlockstack` down to components.

Enclose top level elements in a shared Blockstack context:

````javascript
import { Blockstack } from 'react-blockstack/dist/context'

ReactDOM.render(<Blockstack><App/></Blockstack>, document.getElementById('app-root'))
````

The Blockstack SDK properties are implicitly passed through the component tree and can be used as any other React context.

### Example

The App component below will automatically be updated whenever there is a change in the Blockstack status. Note the use of the `this.context` containing the properties and
that the class is required to have `contextType = BlockstackContext`.

````javascript
import React, { Component } from 'react'
import BlockstackContext from 'react-blockstack/dist/context'

export default class App extends Component {
  static contextType = BlockstackContext
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
````

If there are multiple Blockstack components they will all share the same context.

## Live Demo

The REBL Stack [starter app](https://github.com/REBL-Stack/starter-app)
is a reimplementation of the
[Blockstack react template](https://github.com/blockstack/blockstack-app-generator/tree/master/react/templates).

It demonstrates different ways of using react-blockStack.
You are encouraged to use the example as a starting point for your own projects.

Live at:
[![Netlify Status](https://api.netlify.com/api/v1/badges/4c1f3c5b-c184-4659-935a-c66065978127/deploy-status)](https://react-blockstack.netlify.com)

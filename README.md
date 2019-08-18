# React Blockstack Context

React context for the Blockstack SDK.

## Installation

    npm install react-blockstack-context

## Setup

````javascript
import { initBlockstackContext } from 'react-blockstack-context'

initBlockstackContext()
````

Optionally call with a Blockstack AppConfig.

## As React Hook

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

## As Context Element

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

````

import React from 'react';
import { useBlockstackContext } from 'react-blockstack-context'

// react function component

export default function Signin () {
    const { handleSignIn } = useBlockstackContext()
    return (
      <div hidden={!handleSignIn} className="panel-landing" id="section-1">
        <h1 className="landing-heading">Hello, Blockstack!</h1>
        <p className="lead">
          <button
            className="btn btn-primary btn-lg"
            id="signin-button"
            disabled={ !handleSignIn }
            onClick={ handleSignIn }>
            Sign In with Blockstack
          </button>
        </p>
      </div>
    )
}

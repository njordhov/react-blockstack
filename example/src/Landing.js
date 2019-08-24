import React from 'react';
import { useBlockstack } from 'react-blockstack'

export default function Landing (props) {
  const { signIn } = useBlockstack()
  return (
    <div className="panel-landing" id="section-1">
      <h1 className="landing-heading">Hello, Blockstack!</h1>
      <p className="lead">
        <button
          className="btn btn-primary btn-lg"
          id="signin-button"
          disabled={ !signIn }
          onClick={ signIn }>
          Sign In with Blockstack
        </button>
      </p>
    </div>
  )
}

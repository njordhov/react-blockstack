import React, { Component } from 'react';
import BlockstackContext from 'react-blockstack'

export default class Signin extends Component {
  render() {
    const { signIn } = this.context
    return (
      <div hidden={!signIn} className="panel-landing" id="section-1">
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
}
Signin.contextType = BlockstackContext

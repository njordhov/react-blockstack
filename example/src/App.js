import React, { Component } from 'react';
import Profile from './Profile.js';
import Signin from './Signin.js';
import BlockstackContext from 'react-blockstack-context'

export default class App extends Component {
  render() {
    const { handleSignOut, handleSignIn, person } = this.context
    return (
      <div className="site-wrapper">
        <div className="site-wrapper-inner">
           <Profile person={ person } handleSignOut={ handleSignOut } />
           <Signin handleSignIn={ handleSignIn } />
        </div>
      </div>
    );
  }
}
App.contextType = BlockstackContext

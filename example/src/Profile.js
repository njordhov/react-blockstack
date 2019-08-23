import React, { Component } from 'react';
import BlockstackContext from 'react-blockstack'
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

function Auth ({signOut}) {
  return (
    <button
      className="btn btn-primary btn-lg"
      id="signout-button"
      disabled={ !signOut }
      onClick={ signOut }>
      Logout
    </button>
    )
}

export default class Profile extends Component {
  render () {
    const { person } = this.props
    const { signOut } = this.context
    return (
      <div className="panel-welcome" id="section-2">
        <div className="avatar-section">
          <img src={ person && person.avatarUrl() || avatarFallbackImage }
               className="img-rounded avatar" id="avatar-image" alt=""/>
        </div>
        <h1>Hello, <span id="heading-name">{ person && person.name() || 'Nameless Person' }</span>!</h1>
        <p className="lead">
          <Auth signOut={signOut} />
        </p>
      </div>
    )
  }
}
Profile.contextType = BlockstackContext

import React from 'react';
import { useBlockstack} from 'react-blockstack'

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default function Profile (props) {
  const { signOut, person } = useBlockstack()
  return (
    person ?
    <div className="panel-welcome" id="section-2">
      <div className="avatar-section">
        <img src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="img-rounded avatar" id="avatar-image" alt=""/>
      </div>
      <h1>Hello, <span id="heading-name">{ person.name() ? person.name() : 'Nameless Person' }</span>!</h1>
      <p className="lead">
        <button
          className="btn btn-primary btn-lg"
          id="signout-button"
          disabled={ !signOut }
          onClick={ signOut }>
          Logout
        </button>
      </p>
    </div> : null
  )
}

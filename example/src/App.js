import React from 'react';
import Profile from './Profile.js';
import Signin from './Signin.js';

export default function App (props) {
  return (
    <div className="site-wrapper">
      <div className="site-wrapper-inner">
         <Profile />
         <Signin  />
      </div>
    </div>
  )
}

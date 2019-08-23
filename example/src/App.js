import React from 'react';
import { useBlockstack} from 'react-blockstack'
import Profile from './Profile.js';
import Landing from './Landing.js';

export default function App (props) {
  const { person } = useBlockstack()
  return (
    <div className="site-wrapper">
      <div className="site-wrapper-inner">
         {!person && <Landing />}
         {person && <Profile person={person} />}
      </div>
    </div>
  )
}

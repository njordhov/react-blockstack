import React from 'react'
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.js'
import { AppConfig } from 'blockstack';
import { Blockstack, initBlockstackContext } from 'react-blockstack-context'

// Require Sass file so webpack can build it
import 'bootstrap/dist/css/bootstrap.css';
import'./styles/style.css';

const appConfig = new AppConfig()
initBlockstackContext(appConfig)

ReactDOM.render(<Router><Blockstack><App /></Blockstack></Router>, document.getElementById('root'));

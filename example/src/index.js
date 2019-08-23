import React from 'react'
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.js'
import { Blockstack, initBlockstack } from 'react-blockstack'
import { AppConfig } from 'blockstack';

// Require Sass file so webpack can build it
import 'bootstrap/dist/css/bootstrap.css';
import'./styles/style.css';

const appConfig = new AppConfig()
initBlockstack(appConfig)

ReactDOM.render(<Router><Blockstack><App /></Blockstack></Router>, document.getElementById('root'));

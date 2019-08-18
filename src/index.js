import React, { Component, createContext, useState, useEffect, useContext } from 'react'
import { UserSession, AppConfig, Person } from 'blockstack';
import { Atom, swap, useAtom, deref} from "@dbeining/react-atom"
import { isNil, isEqual, isFunction, merge } from 'lodash'

const contextAtom = Atom.of({})

export function useBlockstackContext () {
  return( useAtom(contextAtom) )
}

export function setContext(update) {
  // use sparingly as it triggers all using components to update
  swap(contextAtom, state => merge({}, state, isFunction(update) ? update(state) : update))
}

function handleSignIn(e) {
  const { userSession } = deref(contextAtom)
  e.preventDefault()
  const update = {handleSignIn: null}
  setContext( update )
  userSession.redirectToSignIn();
}

function handleSignOut(e) {
  const { userSession } = deref(contextAtom)
  e.preventDefault()
  userSession.signUserOut()
  const update = { userData: null,
                   handleSignIn: handleSignIn,
                   handleSignOut: null}
  setContext( update )
}

function handleAuthenticated (userData) {
  window.history.replaceState({}, document.title, "/")
  const update = { userData: userData,
                   person: new Person(userData.profile),
                   handleSignIn: null,
                   handleSignOut: handleSignOut}
  setContext( update )
}

export function initBlockstackContext (options) {
  // Idempotent - mention in documentation!
  const { userSession } = deref(contextAtom)
  if (!userSession) {
    const userSession = new UserSession(options)
    const update = {userSession: userSession}
    setContext( update )
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then( handleAuthenticated )
    } else if (userSession.isUserSignedIn()) {
      handleAuthenticated (userSession.loadUserData())
    } else {
      setContext( { handleSignIn: handleSignIn })
    }
  }
}

export function Blockstack(props) {
   const context = useBlockstackContext()
   return <BlockstackContext.Provider value={context}>
            {props.children}
          </BlockstackContext.Provider>
}

export const BlockstackContext = createContext({userData: null,
                                                handleSignIn: null,
                                                handleSignOut: null})

/* Persistent Context */

function useStateWithLocalStorage (storageKey) {
  const stored = localStorage.getItem(storageKey)
  const content = (typeof stored != 'undefined') ? JSON.parse(stored) : null
  console.log("PERSISTENT local:", stored, typeof stored)
  const [value, setValue] = useState(content)
  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value || null));
  }, [value])
  return [value, setValue];
}

function useStateWithGaiaStorage (userSession, path) {
  const [value, setValue] = useState(null)
  console.log("PERSISTENT = ", value)
  // React roadmap is to support data loading with Suspense hook
  if ( isNil(value) ) {
    userSession.getFile(path)
      .then(stored => {
           console.log("PERSISTENT Get:", path, value, stored)
           const content = !isNil(stored) ? JSON.parse(stored) : {}
           setValue(content)
          })
        }
  // ##FIX: Saves initially loaded value (use updated React.Suspense hook when available)
  useEffect(() => {
    if ( !isNil(value) ) {
         console.log("PERSISTENT Put:", path, JSON.stringify(value))
         userSession.putFile(path, JSON.stringify(value))
    }})
  return [value, setValue]
}

export function Persistent (props) {
  // perhaps should only bind value to context for its children?
  // ##FIX: validate input properties, particularly props.property
  const version = props.version || 0
  const property = props.property
  const path = props.path || property
  const context = useContext(BlockstackContext)
  const { userSession, userData } = context
  const [stored, setStored] = props.local
                            ? useStateWithLocalStorage(props.path)
                            : useStateWithGaiaStorage(userSession, props.path)
  const content = property ? context[property] : null
  useEffect(() => {
    if (stored && !isEqual (content, stored)) {
        console.log("PERSISTENT Set:", content, stored)
        if (version != stored.version) {
          // ## Fix: better handling of version including migration
          console.log("Mismatching version in file", path, " - expected", version, "got", stored.version)
        }
        const entry = {}
        entry[property] = stored.content
        setContext(entry)
  }}, [stored])

  useEffect(() => {
        if (!isEqual (content, stored)) {
          console.log("PERSISTENT save:", content, stored)
          setStored({version: version, property: property, content: content})
        } else {
          console.log("PERSISTENT noop:", content, stored)
        }
      }, [content])

  return (
    props.debug ?
    <div>
      <h1>Persistent {property}</h1>
      <p>Stored: { JSON.stringify( stored ) }</p>
      <p>Context: { JSON.stringify( content ) }</p>
    </div>
    :null)
}

export default BlockstackContext

import React, { Component, createContext, useState, useEffect, useContext } from 'react'
import { UserSession, AppConfig, Person, lookupProfile } from 'blockstack'
import { Atom, swap, useAtom, deref} from "@dbeining/react-atom"
import { isNil, isEqual, isFunction, isUndefined, merge, set } from 'lodash'

const defaultValue = {userData: null, signIn: null, signOut: null}

const contextAtom = Atom.of(defaultValue)

export function useBlockstack () {
  return( useAtom(contextAtom) )
}

export function setContext(update) {
  // use sparingly as it triggers all using components to update
  swap(contextAtom, state => merge({}, state, isFunction(update) ? update(state) : update))
}

function signIn(e) {
  const { userSession } = deref(contextAtom)
  const update = {signIn: null}
  setContext( update )
  userSession.redirectToSignIn() // window.location.pathname
}

function signOut(e) {
  const { userSession } = deref(contextAtom)
  const update = { userData: null,
                   signIn: signIn,
                   signOut: null,
                   person: null }
  setContext( update )
  userSession.signUserOut()
}

function handleAuthenticated (userData) {
  window.history.replaceState({}, document.title, window.location.pathname)
  const update = { userData: userData,
                   person: new Person(userData.profile),
                   signIn: null,
                   signOut: signOut }
  setContext( update )
}

export function initBlockstack (options) {
  // Idempotent - mention in documentation!
  console.log("init blockstack:", options)
  const { userSession } = deref(contextAtom)
  if (!userSession) {
    const userSession = new UserSession(options)
    const update = { userSession: userSession }
    setContext( update )
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then( handleAuthenticated )
    } else if (userSession.isUserSignedIn()) {
      handleAuthenticated (userSession.loadUserData())
    } else {
      setContext( { signIn: signIn })
    }
    return(true)
  } else {
    return (null)
  }
}

export const BlockstackContext = createContext(defaultValue)

export function Blockstack(props) {
   const context = useBlockstack()
   return <BlockstackContext.Provider value={context}>
            {props.children}
          </BlockstackContext.Provider>
}

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

function useStateWithGaiaStorage (path) {
  /* Low level gaia file hook
     Note: Does not guard against multiple hooks for the same file
     Possbly an issue that change is set then value, could introduce inconsisitent state
     Return value:
       1. File read -> content of file
       2. File not existing or empty -> {} // could also be null
       3. File not yet accessed or inaccessible -> undefined
     Attempting to set value when undefined throws an error.
  */
  const [value, setValue] = useState(undefined)
  const [change, setChange] = useState(undefined)
  const updateValue = (update) => {
    console.log("[File] update:", path, update)
    if (!isUndefined(value)) {
      setChange(update)
    } else {
      throw "Premature attempt to modify file:" + path
    }
  }
  console.log("[File]:", path, " = ", value)
  const { userSession, userData } = useBlockstack()
  const isUserSignedIn = !!userData
  // React roadmap is to support data loading with Suspense hook
  useEffect (() => {
    if ( isNil(value) ) {
      if (isUserSignedIn && path) {
          userSession.getFile(path)
          .then(stored => {
               console.info("[File] Get:", path, value, stored)
               const content = !isNil(stored) ? JSON.parse(stored) : {}
               setValue(content)
              })
           .catch(err => {
             console.error("[File] Get error:", err)
           })
        } else if (path) {
          console.info("[File] Get waiting for user to sign on:", path)
        } else {
          console.warn("[File] No file path")
        }
      } else {
        console.log("[File] Get skip:", value)
      }}, [userSession, isUserSignedIn, path])
  useEffect(() => {
    if ( !isNil(change) ) {
         if (!isUserSignedIn) {
           console.warn("[File] User not logged in")
         } else if (!isEqual(change, value)){ // test should be redundant
           const content = JSON.stringify(change)
           const original = value
           setValue(change) // Cannot delay until saved as it will cause inconsistent state
           userSession.putFile(path, content)
           .then(() => console.info("[File] Put", path, content))
           .catch((err) => {
               // Don't revert on error for now as it impairs UX
               // setValue(original)
               console.warn("[File] Put error: ", path, err)
             })
         } else {
           console.log("[File] Put noop:", path)
         }
    }},[change, userSession])
  // FIX: deliver eventual error as third value?
  return [value, updateValue]
}

export function useStored (props) {
  // Generalized persistent property storage
  const {property, overwrite, value, setValue} = props
  const version = props.version || 0
  const path = props.path || property
  const [stored, setStored] = props.local
                            ? useStateWithLocalStorage(path)
                            : useStateWithGaiaStorage(path)
  useEffect(() => {
    // Load data from file
    if (!isUndefined(stored) && !isNil(stored) && !isEqual (value, stored)) {
        console.info("STORED load:", path, stored, "Current:", value)
        if (stored.version && version != stored.version) {
          // ## Fix: better handling of version including migration
          console.error("Mismatching version in file", path, " - expected", version, "got", stored.version)
        }
        if (isFunction(setValue)) {
          setValue(stored.content)
        } else {
          console.warn("Missing setValue property for storing:", property)
        }
      } else {
        console.log("STORED pass:", path, stored, "Current:", value)
      }
  }, [stored])

  useEffect(() => {
      // Store content to file
      if (!isUndefined(stored) && !isUndefined(value) && !isEqual (value, stored && stored.content)) {
        const content = stored && stored.content
        const replacement = overwrite ? value : merge({}, content, value)
        console.info("STORED save:", path, replacement, "Was:", value)
        setStored({version: version, property: property, content: replacement})
      } else {
        console.log("STORED noop:", path, value, stored)
      }
    }, [value, stored])
  return ( stored )
}

export function usePersistent (props){
  // Make context state persistent
  const {property, overwrite} = props
  const context = useBlockstack() // useContext(BlockstackContext) // ## FIX: call useBlockstack() instead??
  const value = property ? context[property] : null
  const setValue = property ? (value) => setContext( set({}, property, value )) : null
  const stored = useStored (merge ({}, props, {value: value, setValue: setValue}))
  return( stored )
}

export function Persistent (props) {
  // perhaps should only bind value to context for its children?
  // ##FIX: validate input properties, particularly props.property
  const {property, debug, overwrite} = props
  const result = usePersistent(props)
  const context = useBlockstack() // useContext(BlockstackContext) // ## FIX: call useBlockstack() instead??
  const content = property ? context[property] : null
  return (
    debug ?
    <div>
      <h1>Persistent {property}</h1>
      <p>Stored: { JSON.stringify( stored ) }</p>
      <p>Context: { JSON.stringify( content ) }</p>
    </div>
    :null)
}

/* External Dapps */

function getAppManifestAtom (appUri) {
  // Out: Atom promise containing a either an app manifest or a null value.
  // Avoid passing outside this module to avoid conflicts if there are multiple react-atom packages in the project
  const atom = Atom.of(null)
  const setValue = (value) => swap(atom, state => value)
  try {
      const manifestUri = appUri + "/manifest.json"
      const controller = new AbortController()
      const cleanup = () => controller.abort()
      console.info("FETCHING:", manifestUri)
      fetch(manifestUri, {signal: controller.signal})
      .then ( response => {response.json().then( setValue )})
      .catch ( err => {console.warn("Failed to get manifest for:", appUri, err)})
      // .finally (() => setValue({}))
    } catch (err) {
      console.warn("Failed fetching when mounting:", err)
      setValue({error: err})
    }
  return (atom)
}

export function createAppManifestHook (appUri) {
  const atom = getAppManifestAtom(appUri)
  return( () => useAtom(atom) )
}

export function useAppManifest (appUri) {
    // null when pending
    const [value, setValue] = useState(null)
    // ## FIX bug: May start another request while pending for a response
    useEffect(() => {  // #FIX: consider useCallback instead
      try {
        const manifestUri = appUri + "/manifest.json"
        const controller = new AbortController()
        const cleanup = () => controller.abort()
        console.info("FETCHING:", manifestUri)
        fetch(manifestUri, {signal: controller.signal})
        .then ( response => {response.json().then( setValue )})
        .catch ( err => {console.warn("Failed to get manifest for:", appUri, err)})
        // .finally (() => setValue({}))
        return (cleanup)
      } catch (err) {
        console.warn("Failed fetching when mounting:", err)
        setValue({error: err})
      }
    }, [appUri])
    return (value)
  }

/* Update document element class  */

export function AuthenticatedDocumentClass (props) {
    // declare a classname decorating the document element when authenticated
    const className = props.name
    const { userData } = useBlockstack()
    useEffect(() => {
      console.log("Updating documentElement classes to reflect signed in status:", !!userData)
      if (userData) {
          document.documentElement.classList.add(className)
          document.documentElement.classList.remove('reloading')
      } else {
          document.documentElement.classList.remove(className)
      }}, [userData])
    return (null)
    }

export default BlockstackContext

/* User Profiles ================================ */

export function useProfile (username, zoneFileLookupURL) {
    // FIX: don't lookup if username is current profile...
    const [value, setValue] = useState(null)
    const { userSession } = useBlockstack()
    useEffect(() => {
      if (userSession && username) {
        lookupProfile(username, zoneFileLookupURL)
        .then(setValue)
        .catch((err) => console.warn("Failed to use profile:", err))
      }}, [userSession, username, zoneFileLookupURL])
    return (value)
}

import React, {
  Component,
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useReducer,
} from "react";
import { UserSession, AppConfig, lookupProfile } from "@stacks/auth";
import { Person } from "@stacks/profile";
import { Atom, swap, useAtom, deref } from "@dbeining/react-atom";
import {
  isNil,
  isNull,
  isEqual,
  isFunction,
  isUndefined,
  merge,
  set,
  identity,
} from "lodash";

const defaultValue = {userData: null, signIn: null, signOut: null, authenticated: false}

const contextAtom = Atom.of(defaultValue)

/**
 * React hook for the Blockstack SDK
 *
 * @return {{userSession: UserSession, userData: ?UserData, signIn: ?function, signOut: ?function, person: ?Person}} Blockstack SDK context
 *
 * @example
 *
 *     useBlockstack()
 */

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
                   authenticated: false,
                   person: null }
  setContext( update )
  userSession.signUserOut()
}

function handleAuthenticated (userData) {
  window.history.replaceState({}, document.title, window.location.pathname)
  const update = { userData: userData,
                   person: new Person(userData.profile),
                   signIn: null,
                   authenticated: true,
                   signOut: signOut }
  setContext( update )
}

export function initBlockstack (options) {
  // Idempotent
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
    return({ userSession: userSession })
  } else {
    return({ userSession: userSession })
  }
}

export default initBlockstack

export const BlockstackContext = createContext(defaultValue)

export function Blockstack(props) {
   const context = useBlockstack()
   return <BlockstackContext.Provider value={context}>
            {props.children}
          </BlockstackContext.Provider>
}

export function didConnect ({userSession: session}) {
  const { userSession, authenticated } = deref(contextAtom)
  if (userSession != session) {
    userSession = session;
    setContext({ userSession })
  }
  if (!authenticated) {
    const userData = userSession.loadUserData();
    handleAuthenticated(userData)
  }
}

export function useConnectOptions (options) {
  const {userSession} = useBlockstack()
  const authOptions = {
    redirectTo: '/',
    manifest: '/manifest.json',
    finished: ({userSession}) => {
      didConnect({userSession})
    },
    userSession: userSession,
    appDetails: {
      name: "Blockstack App",
      icon: '/logo.svg'
    }
  }
  return merge({}, authOptions, options)
}

export function useFile (path, options) {
  const [value, setValue] = useStateWithGaiaStorage (path, merge({reader:identity, writer:identity, initial: null}, options))
  return ([value, !isUndefined(value) ? setValue : null ])
}

/*
function gaiaReducer (state, event) {
  // state machine for gaia file operations
  console.debug("Gaia:", state, event)
  switch (state.status) {
    case "start":
      switch (event.action) {
        case "reading": return({...state, status: "reading", pending: true})
      }
    case "reading":
      switch (event.action) {
        case "read-error": return({...state, status: "read-error", error: event.error})
        case "no-file": return ({...state, status: "no-file"})
        case "read-success": return({...state, status: "ready", content: event.content, pending: false})
      }
    case "no-file":
      switch (event.action) {
        case "writing": return({...state, status: "writing", content: event.content})
      }
    case "writing":
      switch (event.action) {
        case "write-error": return({...state, status: "write-error", error: event.error})
        case "write-complete": return({...state, status: "ready", content: event.content})
      }
    case "ready":
      switch (event.action) {
        case "writing": return({...state, status: "writing", content: event.content})
        case "deleting": return({...state, status: "deleting", content: event.content})
      }
    case "deleting":
      switch (event.action) {
        case "delete-error": return({...state, status: "delete-error", error: event.error})
        case "delete-complete": return ({...state, status: "no-file", content: null})
      }
    default: return (state)
  }
}
*/

function useStateWithGaiaStorage (path, {reader=identity, writer=identity, initial=null}) {
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
  const [pending, setPending] = useState(false)
  // const [{status, pending}, dispatch] = useReducer(gaiaReducer, {:status: "start"})

  const updateValue = (update) => {
    // ##FIX: properly handle update being a fn, call with (change || value)
    //console.log("[File] Update:", path, update)
    if (!isUndefined(value)) {
      if (isFunction(update)) {
        setChange(change => update(!isUndefined(change) ? change : value))
      } else {
        setChange(update)
      }
    } else {
      throw "Premature attempt to update file:" + path
    }
  }
  const { userSession, userData, authenticated } = useBlockstack()
  // React roadmap is to support data loading with Suspense hook
  useEffect (() => {
    if ( isNil(value) ) {
      if (authenticated && path) {
          setPending(true)
          userSession.getFile(path)
          .then(stored => {
               //console.info("[File] Get:", path, value, stored)
               const content = !isNil(stored) ? reader(stored) : initial
               setValue(content)
              })
          .catch(error => {
             if (error.code === "does_not_exist") { 
               // SDK 21 errs when file does not exist
               setValue(initial)
             } else {
               console.error("[File] Get error:", error) 
             }
           })
           .finally(() => setPending(false))
        } else if (path) {
          console.info("Waiting for user to sign on before reading file:", path)
        } else {
          console.warn("[File] No file path")
        }
      } else {
        //console.log("[File] Get skip:", value)
      }}, [userSession, authenticated, path])

  useEffect(() => {
    if ( !isUndefined(change) && !pending ) {
         if (!authenticated) {
           console.warn("[File] User not logged in")
         } else if (!isEqual(change, value)){
           if (isNull(change)) {
             setPending(true)
             userSession.deleteFile(path)
             .then(() => setValue(null))
             .catch((err) => console.warn("Failed deleting:", path, err))
             .finally(() => setPending(false))
           } else {
             const content = writer(change)
             const original = value
             // setValue(change) // Cannot delay until saved? as it may cause inconsistent state
             setPending(true)
             userSession.putFile(path, content)
             .then(() => {
               // console.info("[File] Put", path, content);
               setValue(change)
               setPending(false)})
             .catch((err) => {
                 // Don't revert on error for now as it impairs UX
                 // setValue(original)
                 setPending(false) // FIX: delay before retry?
                 console.warn("[File] Put error: ", path, err)
               })}
         } else {
           // console.log("[File] Put noop:", path)
         }
    }},[change, userSession, pending])
  // FIX: deliver eventual error as third value?
  return [value, updateValue]
}

/*
=======================================================================
EXPERIMENTAL FUNCTIONALITY
APT TO CHANGE WITHOUT FURTHER NOTICE
=======================================================================
*/

/* Low-level hooks for Gaia file system */

export function useFilesList () {
  /* First value is a list of files, defaults to empty list.
     Better of undefined until names retrieved?
     Second value is null then number of files when list is complete.
     FIX: Is number of files useful as output? What about errors? */
  const { userSession, userData, authenticated } = useBlockstack()
  const [value, setValue] = useState([])
  const [fileCount, setCount] = useState(null)
  const appendFile = useCallback(path => {
     setValue((value) => [...value, path]);
     return true})
  useEffect( () => {
    if (userSession && authenticated) {
       userSession.listFiles(appendFile)
       .then(setCount)
       .catch((err) => console.warn("Failed retrieving files list:", err))
  }}, [userSession, authenticated])
  return ([value, fileCount])
}

export function useFileUrl (path) {
  // FIX: Should combine with others?
  const { userSession, userData } = useBlockstack()
  const [value, setValue] = useState(null)
  useEffect( () => {
    if (userSession) {
      if (path) {
        userSession.getFileUrl(path)
        .then(setValue)
        .catch((err) => console.warn("Failed getting file url:", err))
      } else {
        setValue(null)
      }
    }
  }, [userSession, path])
  return(value)
}

export function useFetch (path, init) {
  // For internal uses, likely better covered by other libraries
  const url = useFileUrl(path)
  const [value, setValue] = useState(null)
  useEffect ( () => {
    if (url) {
      fetch(url, init)
      .then(setValue)
      .catch((err) => console.warn("Failed fetching url:", err))
    } else {
      setValue(null)
    }
  }, [url])
  return (value)
}

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

export function useStored (props) {
  // Generalized persistent property storage
  const {property, overwrite, value, setValue} = props
  const version = props.version || 0
  const path = props.path || property
  const [stored, setStored] = props.local
                            ? useStateWithLocalStorage(path)
                            : useStateWithGaiaStorage(path, {reader: JSON.parse, writer: JSON.stringify, initial: {}})
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

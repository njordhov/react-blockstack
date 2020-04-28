"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useBlockstack = useBlockstack;
exports.setContext = setContext;
exports.initBlockstack = initBlockstack;
exports.Blockstack = Blockstack;
exports.didConnect = didConnect;
exports.useConnectOptions = useConnectOptions;
exports.useFile = useFile;
exports.useFilesList = useFilesList;
exports.useFileUrl = useFileUrl;
exports.useFetch = useFetch;
exports.useStored = useStored;
exports.usePersistent = usePersistent;
exports.Persistent = Persistent;
exports.createAppManifestHook = createAppManifestHook;
exports.useAppManifest = useAppManifest;
exports.AuthenticatedDocumentClass = AuthenticatedDocumentClass;
exports.useProfile = useProfile;
exports.BlockstackContext = exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _blockstack = require("blockstack");

var _reactAtom = require("@dbeining/react-atom");

var _lodash = require("lodash");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

var defaultValue = {
  userData: null,
  signIn: null,
  signOut: null,
  authenticated: false
};

var contextAtom = _reactAtom.Atom.of(defaultValue);
/**
 * React hook for the Blockstack SDK
 *
 * @return {{userSession: UserSession, userData: ?UserData, signIn: ?function, signOut: ?function, person: ?Person}} Blockstack SDK context
 *
 * @example
 *
 *     useBlockstack()
 */


function useBlockstack() {
  return (0, _reactAtom.useAtom)(contextAtom);
}

function setContext(update) {
  // use sparingly as it triggers all using components to update
  (0, _reactAtom.swap)(contextAtom, function (state) {
    return (0, _lodash.merge)({}, state, (0, _lodash.isFunction)(update) ? update(state) : update);
  });
}

function signIn(e) {
  var _deref = (0, _reactAtom.deref)(contextAtom),
      userSession = _deref.userSession;

  var update = {
    signIn: null
  };
  setContext(update);
  userSession.redirectToSignIn(); // window.location.pathname
}

function signOut(e) {
  var _deref2 = (0, _reactAtom.deref)(contextAtom),
      userSession = _deref2.userSession;

  var update = {
    userData: null,
    signIn: signIn,
    signOut: null,
    authenticated: false,
    person: null
  };
  setContext(update);
  userSession.signUserOut();
}

function handleAuthenticated(userData) {
  window.history.replaceState({}, document.title, window.location.pathname);
  var update = {
    userData: userData,
    person: new _blockstack.Person(userData.profile),
    signIn: null,
    authenticated: true,
    signOut: signOut
  };
  setContext(update);
}

function initBlockstack(options) {
  // Idempotent
  var _deref3 = (0, _reactAtom.deref)(contextAtom),
      userSession = _deref3.userSession;

  if (!userSession) {
    var _userSession = new _blockstack.UserSession(options);

    var update = {
      userSession: _userSession
    };
    setContext(update);

    if (_userSession.isSignInPending()) {
      _userSession.handlePendingSignIn().then(handleAuthenticated);
    } else if (_userSession.isUserSignedIn()) {
      handleAuthenticated(_userSession.loadUserData());
    } else {
      setContext({
        signIn: signIn
      });
    }

    return {
      userSession: _userSession
    };
  } else {
    return {
      userSession: userSession
    };
  }
}

var _default = initBlockstack;
exports["default"] = _default;
var BlockstackContext = (0, _react.createContext)(defaultValue);
exports.BlockstackContext = BlockstackContext;

function Blockstack(props) {
  var context = useBlockstack();
  return /*#__PURE__*/_react["default"].createElement(BlockstackContext.Provider, {
    value: context
  }, props.children);
}

function didConnect(_ref) {
  var session = _ref.userSession;

  var _deref4 = (0, _reactAtom.deref)(contextAtom),
      userSession = _deref4.userSession,
      authenticated = _deref4.authenticated;

  if (userSession != session) {
    userSession = (_readOnlyError("userSession"), session);
    setContext({
      userSession: userSession
    });
  }

  if (!authenticated) {
    var userData = userSession.loadUserData();
    handleAuthenticated(userData);
  }
}

function useConnectOptions(options) {
  var _useBlockstack = useBlockstack(),
      userSession = _useBlockstack.userSession;

  var authOptions = {
    redirectTo: '/',
    manifest: '/manifest.json',
    finished: function finished(_ref2) {
      var userSession = _ref2.userSession;
      didConnect({
        userSession: userSession
      });
    },
    userSession: userSession,
    appDetails: {
      name: "Blockstack App",
      icon: '/logo.svg'
    }
  };
  return (0, _lodash.merge)({}, authOptions, options);
}

function useFile(path, options) {
  var _useStateWithGaiaStor = useStateWithGaiaStorage(path, (0, _lodash.merge)({
    reader: _lodash.identity,
    writer: _lodash.identity,
    initial: null
  }, options)),
      _useStateWithGaiaStor2 = _slicedToArray(_useStateWithGaiaStor, 2),
      value = _useStateWithGaiaStor2[0],
      setValue = _useStateWithGaiaStor2[1];

  return [value, !(0, _lodash.isUndefined)(value) ? setValue : null];
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


function useStateWithGaiaStorage(path, _ref3) {
  var _ref3$reader = _ref3.reader,
      reader = _ref3$reader === void 0 ? _lodash.identity : _ref3$reader,
      _ref3$writer = _ref3.writer,
      writer = _ref3$writer === void 0 ? _lodash.identity : _ref3$writer,
      _ref3$initial = _ref3.initial,
      initial = _ref3$initial === void 0 ? null : _ref3$initial;

  /* Low level gaia file hook
     Note: Does not guard against multiple hooks for the same file
     Possbly an issue that change is set then value, could introduce inconsisitent state
     Return value:
       1. File read -> content of file
       2. File not existing or empty -> {} // could also be null
       3. File not yet accessed or inaccessible -> undefined
     Attempting to set value when undefined throws an error.
  */
  var _useState = (0, _react.useState)(undefined),
      _useState2 = _slicedToArray(_useState, 2),
      value = _useState2[0],
      setValue = _useState2[1];

  var _useState3 = (0, _react.useState)(undefined),
      _useState4 = _slicedToArray(_useState3, 2),
      change = _useState4[0],
      setChange = _useState4[1];

  var _useState5 = (0, _react.useState)(false),
      _useState6 = _slicedToArray(_useState5, 2),
      pending = _useState6[0],
      setPending = _useState6[1]; // const [{status, pending}, dispatch] = useReducer(gaiaReducer, {:status: "start"})


  var updateValue = function updateValue(update) {
    // ##FIX: properly handle update being a fn, call with (change || value)
    //console.log("[File] Update:", path, update)
    if (!(0, _lodash.isUndefined)(value)) {
      if ((0, _lodash.isFunction)(update)) {
        setChange(function (change) {
          return update(!(0, _lodash.isUndefined)(change) ? change : value);
        });
      } else {
        setChange(update);
      }
    } else {
      throw "Premature attempt to update file:" + path;
    }
  };

  var _useBlockstack2 = useBlockstack(),
      userSession = _useBlockstack2.userSession,
      userData = _useBlockstack2.userData,
      authenticated = _useBlockstack2.authenticated; // React roadmap is to support data loading with Suspense hook


  (0, _react.useEffect)(function () {
    if ((0, _lodash.isNil)(value)) {
      if (authenticated && path) {
        setPending(true);
        userSession.getFile(path).then(function (stored) {
          //console.info("[File] Get:", path, value, stored)
          var content = !(0, _lodash.isNil)(stored) ? reader(stored) : initial;
          setValue(content);
        })["catch"](function (err) {
          if (error.code === "does_not_exist") {
            // SDK 21 errs when file does not exist
            setValue(initial);
          } else {
            console.error("[File] Get error:", err);
          }
        })["finally"](function () {
          return setPending(false);
        });
      } else if (path) {
        console.info("Waiting for user to sign on before reading file:", path);
      } else {
        console.warn("[File] No file path");
      }
    } else {//console.log("[File] Get skip:", value)
    }
  }, [userSession, authenticated, path]);
  (0, _react.useEffect)(function () {
    if (!(0, _lodash.isUndefined)(change) && !pending) {
      if (!authenticated) {
        console.warn("[File] User not logged in");
      } else if (!(0, _lodash.isEqual)(change, value)) {
        if ((0, _lodash.isNull)(change)) {
          setPending(true);
          userSession.deleteFile(path).then(function () {
            return setValue(null);
          })["catch"](function (err) {
            return console.warn("Failed deleting:", path, err);
          })["finally"](function () {
            return setPending(false);
          });
        } else {
          var content = writer(change);
          var original = value; // setValue(change) // Cannot delay until saved? as it may cause inconsistent state

          setPending(true);
          userSession.putFile(path, content).then(function () {
            // console.info("[File] Put", path, content);
            setValue(change);
            setPending(false);
          })["catch"](function (err) {
            // Don't revert on error for now as it impairs UX
            // setValue(original)
            setPending(false); // FIX: delay before retry?

            console.warn("[File] Put error: ", path, err);
          });
        }
      } else {// console.log("[File] Put noop:", path)
      }
    }
  }, [change, userSession, pending]); // FIX: deliver eventual error as third value?

  return [value, updateValue];
}
/*
=======================================================================
EXPERIMENTAL FUNCTIONALITY
APT TO CHANGE WITHOUT FURTHER NOTICE
=======================================================================
*/

/* Low-level hooks for Gaia file system */


function useFilesList() {
  /* First value is a list of files, defaults to empty list.
     Better of undefined until names retrieved?
     Second value is null then number of files when list is complete.
     FIX: Is number of files useful as output? What about errors? */
  var _useBlockstack3 = useBlockstack(),
      userSession = _useBlockstack3.userSession,
      userData = _useBlockstack3.userData,
      authenticated = _useBlockstack3.authenticated;

  var _useState7 = (0, _react.useState)([]),
      _useState8 = _slicedToArray(_useState7, 2),
      value = _useState8[0],
      setValue = _useState8[1];

  var _useState9 = (0, _react.useState)(null),
      _useState10 = _slicedToArray(_useState9, 2),
      fileCount = _useState10[0],
      setCount = _useState10[1];

  var appendFile = (0, _react.useCallback)(function (path) {
    setValue(function (value) {
      return [].concat(_toConsumableArray(value), [path]);
    });
    return true;
  });
  (0, _react.useEffect)(function () {
    if (userSession && authenticated) {
      userSession.listFiles(appendFile).then(setCount)["catch"](function (err) {
        return console.warn("Failed retrieving files list:", err);
      });
    }
  }, [userSession, authenticated]);
  return [value, fileCount];
}

function useFileUrl(path) {
  // FIX: Should combine with others?
  var _useBlockstack4 = useBlockstack(),
      userSession = _useBlockstack4.userSession,
      userData = _useBlockstack4.userData;

  var _useState11 = (0, _react.useState)(null),
      _useState12 = _slicedToArray(_useState11, 2),
      value = _useState12[0],
      setValue = _useState12[1];

  (0, _react.useEffect)(function () {
    if (userSession) {
      if (path) {
        userSession.getFileUrl(path).then(setValue)["catch"](function (err) {
          return console.warn("Failed getting file url:", err);
        });
      } else {
        setValue(null);
      }
    }
  }, [userSession, path]);
  return value;
}

function useFetch(path, init) {
  // For internal uses, likely better covered by other libraries
  var url = useFileUrl(path);

  var _useState13 = (0, _react.useState)(null),
      _useState14 = _slicedToArray(_useState13, 2),
      value = _useState14[0],
      setValue = _useState14[1];

  (0, _react.useEffect)(function () {
    if (url) {
      fetch(url, init).then(setValue)["catch"](function (err) {
        return console.warn("Failed fetching url:", err);
      });
    } else {
      setValue(null);
    }
  }, [url]);
  return value;
}

function useStateWithLocalStorage(storageKey) {
  var stored = localStorage.getItem(storageKey);
  var content = typeof stored != 'undefined' ? JSON.parse(stored) : null;
  console.log("PERSISTENT local:", stored, _typeof(stored));

  var _useState15 = (0, _react.useState)(content),
      _useState16 = _slicedToArray(_useState15, 2),
      value = _useState16[0],
      setValue = _useState16[1];

  _react["default"].useEffect(function () {
    localStorage.setItem(storageKey, JSON.stringify(value || null));
  }, [value]);

  return [value, setValue];
}

function useStored(props) {
  // Generalized persistent property storage
  var property = props.property,
      overwrite = props.overwrite,
      value = props.value,
      setValue = props.setValue;
  var version = props.version || 0;
  var path = props.path || property;

  var _ref4 = props.local ? useStateWithLocalStorage(path) : useStateWithGaiaStorage(path, {
    reader: JSON.parse,
    writer: JSON.stringify,
    initial: {}
  }),
      _ref5 = _slicedToArray(_ref4, 2),
      stored = _ref5[0],
      setStored = _ref5[1];

  (0, _react.useEffect)(function () {
    // Load data from file
    if (!(0, _lodash.isUndefined)(stored) && !(0, _lodash.isNil)(stored) && !(0, _lodash.isEqual)(value, stored)) {
      console.info("STORED load:", path, stored, "Current:", value);

      if (stored.version && version != stored.version) {
        // ## Fix: better handling of version including migration
        console.error("Mismatching version in file", path, " - expected", version, "got", stored.version);
      }

      if ((0, _lodash.isFunction)(setValue)) {
        setValue(stored.content);
      } else {
        console.warn("Missing setValue property for storing:", property);
      }
    } else {
      console.log("STORED pass:", path, stored, "Current:", value);
    }
  }, [stored]);
  (0, _react.useEffect)(function () {
    // Store content to file
    if (!(0, _lodash.isUndefined)(stored) && !(0, _lodash.isUndefined)(value) && !(0, _lodash.isEqual)(value, stored && stored.content)) {
      var content = stored && stored.content;
      var replacement = overwrite ? value : (0, _lodash.merge)({}, content, value);
      console.info("STORED save:", path, replacement, "Was:", value);
      setStored({
        version: version,
        property: property,
        content: replacement
      });
    } else {
      console.log("STORED noop:", path, value, stored);
    }
  }, [value, stored]);
  return stored;
}

function usePersistent(props) {
  // Make context state persistent
  var property = props.property,
      overwrite = props.overwrite;
  var context = useBlockstack(); // useContext(BlockstackContext) // ## FIX: call useBlockstack() instead??

  var value = property ? context[property] : null;
  var setValue = property ? function (value) {
    return setContext((0, _lodash.set)({}, property, value));
  } : null;
  var stored = useStored((0, _lodash.merge)({}, props, {
    value: value,
    setValue: setValue
  }));
  return stored;
}

function Persistent(props) {
  // perhaps should only bind value to context for its children?
  // ##FIX: validate input properties, particularly props.property
  var property = props.property,
      debug = props.debug,
      overwrite = props.overwrite;
  var result = usePersistent(props);
  var context = useBlockstack(); // useContext(BlockstackContext) // ## FIX: call useBlockstack() instead??

  var content = property ? context[property] : null;
  return debug ? /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("h1", null, "Persistent ", property), /*#__PURE__*/_react["default"].createElement("p", null, "Stored: ", JSON.stringify(stored)), /*#__PURE__*/_react["default"].createElement("p", null, "Context: ", JSON.stringify(content))) : null;
}
/* External Dapps */


function getAppManifestAtom(appUri) {
  // Out: Atom promise containing a either an app manifest or a null value.
  // Avoid passing outside this module to avoid conflicts if there are multiple react-atom packages in the project
  var atom = _reactAtom.Atom.of(null);

  var setValue = function setValue(value) {
    return (0, _reactAtom.swap)(atom, function (state) {
      return value;
    });
  };

  try {
    var manifestUri = appUri + "/manifest.json";
    var controller = new AbortController();

    var cleanup = function cleanup() {
      return controller.abort();
    };

    console.info("FETCHING:", manifestUri);
    fetch(manifestUri, {
      signal: controller.signal
    }).then(function (response) {
      response.json().then(setValue);
    })["catch"](function (err) {
      console.warn("Failed to get manifest for:", appUri, err);
    }); // .finally (() => setValue({}))
  } catch (err) {
    console.warn("Failed fetching when mounting:", err);
    setValue({
      error: err
    });
  }

  return atom;
}

function createAppManifestHook(appUri) {
  var atom = getAppManifestAtom(appUri);
  return function () {
    return (0, _reactAtom.useAtom)(atom);
  };
}

function useAppManifest(appUri) {
  // null when pending
  var _useState17 = (0, _react.useState)(null),
      _useState18 = _slicedToArray(_useState17, 2),
      value = _useState18[0],
      setValue = _useState18[1]; // ## FIX bug: May start another request while pending for a response


  (0, _react.useEffect)(function () {
    // #FIX: consider useCallback instead
    try {
      var manifestUri = appUri + "/manifest.json";
      var controller = new AbortController();

      var cleanup = function cleanup() {
        return controller.abort();
      };

      console.info("FETCHING:", manifestUri);
      fetch(manifestUri, {
        signal: controller.signal
      }).then(function (response) {
        response.json().then(setValue);
      })["catch"](function (err) {
        console.warn("Failed to get manifest for:", appUri, err);
      }); // .finally (() => setValue({}))

      return cleanup;
    } catch (err) {
      console.warn("Failed fetching when mounting:", err);
      setValue({
        error: err
      });
    }
  }, [appUri]);
  return value;
}
/* Update document element class  */


function AuthenticatedDocumentClass(props) {
  // declare a classname decorating the document element when authenticated
  var className = props.name;

  var _useBlockstack5 = useBlockstack(),
      userData = _useBlockstack5.userData;

  (0, _react.useEffect)(function () {
    console.log("Updating documentElement classes to reflect signed in status:", !!userData);

    if (userData) {
      document.documentElement.classList.add(className);
      document.documentElement.classList.remove('reloading');
    } else {
      document.documentElement.classList.remove(className);
    }
  }, [userData]);
  return null;
}
/* User Profiles ================================ */


function useProfile(username, zoneFileLookupURL) {
  // FIX: don't lookup if username is current profile...
  var _useState19 = (0, _react.useState)(null),
      _useState20 = _slicedToArray(_useState19, 2),
      value = _useState20[0],
      setValue = _useState20[1];

  var _useBlockstack6 = useBlockstack(),
      userSession = _useBlockstack6.userSession;

  (0, _react.useEffect)(function () {
    if (userSession && username) {
      (0, _blockstack.lookupProfile)(username, zoneFileLookupURL).then(setValue)["catch"](function (err) {
        return console.warn("Failed to use profile:", err);
      });
    }
  }, [userSession, username, zoneFileLookupURL]);
  return value;
}
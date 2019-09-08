"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useBlockstack = useBlockstack;
exports.setContext = setContext;
exports.initBlockstack = initBlockstack;
exports.Blockstack = Blockstack;
exports.useStored = useStored;
exports.usePersistent = usePersistent;
exports.Persistent = Persistent;
exports.getAppManifestAtom = getAppManifestAtom;
exports.useAppManifest = useAppManifest;
exports.AuthenticatedDocumentClass = AuthenticatedDocumentClass;
exports["default"] = exports.BlockstackContext = void 0;

var _react = _interopRequireWildcard(require("react"));

var _blockstack = require("blockstack");

var _reactAtom = require("@dbeining/react-atom");

var _lodash = require("lodash");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var defaultValue = {
  userData: null,
  signIn: null,
  signOut: null
};

var contextAtom = _reactAtom.Atom.of(defaultValue);

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
    signOut: signOut
  };
  setContext(update);
}

function initBlockstack(options) {
  // Idempotent - mention in documentation!
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
  }
}

var BlockstackContext = (0, _react.createContext)(defaultValue);
exports.BlockstackContext = BlockstackContext;

function Blockstack(props) {
  var context = useBlockstack();
  return _react["default"].createElement(BlockstackContext.Provider, {
    value: context
  }, props.children);
}
/* Persistent Context */


function useStateWithLocalStorage(storageKey) {
  var stored = localStorage.getItem(storageKey);
  var content = typeof stored != 'undefined' ? JSON.parse(stored) : null;
  console.log("PERSISTENT local:", stored, _typeof(stored));

  var _useState = (0, _react.useState)(content),
      _useState2 = _slicedToArray(_useState, 2),
      value = _useState2[0],
      setValue = _useState2[1];

  _react["default"].useEffect(function () {
    localStorage.setItem(storageKey, JSON.stringify(value || null));
  }, [value]);

  return [value, setValue];
}

function useStateWithGaiaStorage(path) {
  // Low level gaia file hook - does not guard against multiple instances for the same file
  var _useState3 = (0, _react.useState)(null),
      _useState4 = _slicedToArray(_useState3, 2),
      value = _useState4[0],
      setValue = _useState4[1];

  console.log("PERSISTENT:", path, " = ", value);

  var _useBlockstack = useBlockstack(),
      userSession = _useBlockstack.userSession,
      userData = _useBlockstack.userData; // React roadmap is to support data loading with Suspense hook


  (0, _react.useEffect)(function () {
    if ((0, _lodash.isNil)(value)) {
      if (userData && path) {
        userSession.getFile(path).then(function (stored) {
          console.info("[PERSISTENT Get]", path, value, stored);
          var content = !(0, _lodash.isNil)(stored) ? JSON.parse(stored) : {};
          setValue(content);
        })["catch"](function (err) {
          console.error("[PERSISTENT Get] Error:", err);
        });
      } else if (path) {
        console.info("[PERSISTENT Get] Waiting for user to sign on before loading:", path);
      } else {
        console.warn("[PERSISTENT Get] No file path");
      }
    }
  }, [userSession, userData, path]); // ##FIX: Don't save initially loaded value (use updated React.Suspense hook when available)

  (0, _react.useEffect)(function () {
    if (!(0, _lodash.isNil)(value)) {
      if (!userSession.isUserSignedIn()) {
        console.warn("PERSISTENT Put Fail: user no longer logged in");
      } else {
        console.info("PERSISTENT Put:", path, JSON.stringify(value));
        userSession.putFile(path, JSON.stringify(value));
      }
    }
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
  var context = useBlockstack();
  var userSession = context.userSession,
      userData = context.userData;

  var _ref = props.local ? useStateWithLocalStorage(path) : useStateWithGaiaStorage(path),
      _ref2 = _slicedToArray(_ref, 2),
      stored = _ref2[0],
      setStored = _ref2[1];

  (0, _react.useEffect)(function () {
    // Load data from file
    if (!(0, _lodash.isNil)(stored) && !(0, _lodash.isEqual)(value, stored)) {
      console.info("PERSISTENT Load:", value, stored);

      if (version != stored.version) {
        // ## Fix: better handling of version including migration
        console.error("Mismatching version in file", path, " - expected", version, "got", stored.version);
      }

      if ((0, _lodash.isFunction)(setValue)) {
        setValue(stored.content);
      } else {
        console.warn("Missing setValue property for storing:", property);
      }
    }
  }, [stored]);
  (0, _react.useEffect)(function () {
    // Store content to file
    if (!(0, _lodash.isUndefined)(value) && !(0, _lodash.isEqual)(value, stored && stored.content)) {
      var content = stored && stored.content;
      var replacement = overwrite ? value : (0, _lodash.merge)({}, content, value);
      console.info("PERSISTENT save:", value, replacement);
      setStored({
        version: version,
        property: property,
        content: replacement
      });
    } else {
      console.log("PERSISTENT noop:", value, stored);
    }
  }, [value]);
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
  return debug ? _react["default"].createElement("div", null, _react["default"].createElement("h1", null, "Persistent ", property), _react["default"].createElement("p", null, "Stored: ", JSON.stringify(stored)), _react["default"].createElement("p", null, "Context: ", JSON.stringify(content))) : null;
}
/* External Dapps */


function getAppManifestAtom(appUri) {
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

function useAppManifest(appUri) {
  // null when pending
  var _useState5 = (0, _react.useState)(null),
      _useState6 = _slicedToArray(_useState5, 2),
      value = _useState6[0],
      setValue = _useState6[1]; // ## FIX bug: May start another request while pending for a response


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

  var _useBlockstack2 = useBlockstack(),
      userData = _useBlockstack2.userData;

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

var _default = BlockstackContext;
exports["default"] = _default;
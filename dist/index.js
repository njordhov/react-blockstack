'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BlockstackContext = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

exports.useBlockstackContext = useBlockstackContext;
exports.setContext = setContext;
exports.initBlockstackContext = initBlockstackContext;
exports.Blockstack = Blockstack;
exports.Persistent = Persistent;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _blockstack = require('blockstack');

var _reactAtom = require('@dbeining/react-atom');

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var contextAtom = _reactAtom.Atom.of({});

function useBlockstackContext() {
  return (0, _reactAtom.useAtom)(contextAtom);
}

var merge = function merge(obj1, obj2) {
  return Object.assign({}, obj1, obj2);
};

function setContext(update) {
  // use sparingly as it triggers all using components to update
  (0, _reactAtom.swap)(contextAtom, function (state) {
    return merge(state, (0, _lodash.isFunction)(update) ? update(state) : update);
  });
}

function handleSignIn(e) {
  var _deref = (0, _reactAtom.deref)(contextAtom),
      userSession = _deref.userSession;

  e.preventDefault();
  userSession.redirectToSignIn();
}

function handleSignOut(e) {
  var _deref2 = (0, _reactAtom.deref)(contextAtom),
      userSession = _deref2.userSession;

  e.preventDefault();
  userSession.signUserOut();
  var update = { userData: null,
    handleSignIn: handleSignIn,
    handleSignOut: null };
  setContext(update);
  document.documentElement.classList.remove("user-signed-in");
}

var BlockstackContext = exports.BlockstackContext = (0, _react.createContext)(null);

function handleAuthenticated(userData) {
  console.log("Signed In");
  window.history.replaceState({}, document.title, "/");
  var update = { userData: userData,
    person: new _blockstack.Person(userData.profile),
    handleSignIn: null,
    handleSignOut: handleSignOut };
  setContext(update);
}

function initBlockstackContext(options) {
  // Idempotent - mention in documentation!
  var _deref3 = (0, _reactAtom.deref)(contextAtom),
      userSession = _deref3.userSession;

  if (!userSession) {
    var _userSession = new _blockstack.UserSession(options);
    var update = { userSession: _userSession,
      userData: null,
      handleSignIn: handleSignIn,
      handleSignOut: null };
    setContext(update);
    if (_userSession.isSignInPending()) {
      _userSession.handlePendingSignIn().then(handleAuthenticated);
    } else if (_userSession.isUserSignedIn()) {
      handleAuthenticated(_userSession.loadUserData());
    }
  }
}

function Blockstack(props) {
  var context = useBlockstackContext();
  return _jsx(BlockstackContext.Provider, {
    value: context
  }, void 0, props.children);
}

/* Persistent Context */

function useStateWithLocalStorage(storageKey) {
  var stored = localStorage.getItem(storageKey);
  var content = typeof stored != 'undefined' ? JSON.parse(stored) : null;
  console.log("PERSISTENT local:", stored, typeof stored === 'undefined' ? 'undefined' : _typeof(stored));

  var _useState = (0, _react.useState)(content),
      _useState2 = _slicedToArray(_useState, 2),
      value = _useState2[0],
      setValue = _useState2[1];

  _react2.default.useEffect(function () {
    localStorage.setItem(storageKey, JSON.stringify(value || null));
  }, [value]);
  return [value, setValue];
}

function useStateWithGaiaStorage(userSession, path) {
  var _useState3 = (0, _react.useState)(null),
      _useState4 = _slicedToArray(_useState3, 2),
      value = _useState4[0],
      setValue = _useState4[1];

  console.log("PERSISTENT = ", value);
  // React roadmap is to support data loading with Suspense hook
  if ((0, _lodash.isNil)(value)) {
    userSession.getFile(path).then(function (stored) {
      console.log("PERSISTENT Get:", path, value, stored);
      var content = !(0, _lodash.isNil)(stored) ? JSON.parse(stored) : {};
      setValue(content);
    });
  }
  // ##FIX: Saves initially loaded value (use updated React.Suspense hook when available)
  (0, _react.useEffect)(function () {
    if (!(0, _lodash.isNil)(value)) {
      console.log("PERSISTENT Put:", path, JSON.stringify(value));
      userSession.putFile(path, JSON.stringify(value));
    }
  });
  return [value, setValue];
}

function Persistent(props) {
  // perhaps should only bind value to context for its children?
  // ##FIX: validate input properties, particularly props.property
  var version = props.version || 0;
  var property = props.property;
  var path = props.path || property;
  var context = (0, _react.useContext)(BlockstackContext);
  var userSession = context.userSession,
      userData = context.userData;

  var _ref = props.local ? useStateWithLocalStorage(props.path) : useStateWithGaiaStorage(userSession, props.path),
      _ref2 = _slicedToArray(_ref, 2),
      stored = _ref2[0],
      setStored = _ref2[1];

  var content = property ? context[property] : null;
  (0, _react.useEffect)(function () {
    if (stored && !(0, _lodash.isEqual)(content, stored)) {
      console.log("PERSISTENT Set:", content, stored);
      if (version != stored.version) {
        // ## Fix: better handling of version including migration
        console.log("Mismatching version in file", path, " - expected", version, "got", stored.version);
      }
      var entry = {};
      entry[property] = stored.content;
      setContext(entry);
    }
  }, [stored]);

  (0, _react.useEffect)(function () {
    if (!(0, _lodash.isEqual)(content, stored)) {
      console.log("PERSISTENT save:", content, stored);
      setStored({ version: version, property: property, content: content });
    } else {
      console.log("PERSISTENT noop:", content, stored);
    }
  }, [content]);

  return props.debug ? _jsx('div', {}, void 0, _jsx('h1', {}, void 0, 'Persistent ', property), _jsx('p', {}, void 0, 'Stored: ', JSON.stringify(stored)), _jsx('p', {}, void 0, 'Context: ', JSON.stringify(content))) : null;
}

exports.default = BlockstackContext;
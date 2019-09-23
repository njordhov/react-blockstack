# Development Guide

For the react-blockstack package.

## Publish to npm

The react-blockstack package is published at:

https://www.npmjs.com/package/react-blockstack

First test in the example or another local project (see other section).

To publish a new version, first update the version build the distribution:

    npm run build
    npm version [patch | minor | major]
    npm publish

# Test react-blockstack in a local project

During development of this package, it can be used/tested in a local project
without first publishing to npm (but see issues below).

1. In this directory, execute:

    npm install
    npm run build
    npm link

2. In the dependent project top directory, execute:

    npm link react-blockstack
    npm install

If `npm install` reports the package is not found, try deleting the package-lock.json or see this for other options:

https://stackoverflow.com/questions/24550515/npm-after-npm-link-module-is-not-found

If `npm start` reports missing modules when loading react-blockstack, try running `npm install` in this module.

If there are problems related to "[react hook] can only be called inside the body of a function component" suggesting missing or mismatching modules (like react-dom)
use `npm ls react-dom` in using project to investigate. Removing package-lock.json and
reinstalling is a potential fix. Also make sure to use same case for imported names (`React`). And `npm link` doesn't work well with hooks, says posters at:
https://github.com/facebook/react/issues/13991
https://github.com/webpack/webpack/issues/8607#issuecomment-453068938
https://github.com/transitive-bullshit/create-react-library/issues/99

Verified work-around for link issue is to change the dependency in project to:
"react": "file:../node_modules/react"
But npm install has to be run first... so it's a drag.

Adding this to webpack.config.js appears to have done the trick:
"resolve": { "alias": { "react": "./node_modules/react" }}

Other possibility:
"Solution was as simple as adding these lines to webpack.config.js:""
module.exports = {
    externals: [
        "react",
        "react-dom"
    ],
};

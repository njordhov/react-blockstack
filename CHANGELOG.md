# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.6.9] - 2020-04-28

- The useFile hook doesn't fail with SDK 21 when the file is missing
- Documenting the `useConnectOptions` hook for Connect integration

## [0.6.8] - 2020-03-27

- Unofficial `useConnectOptions` hook for Connect integration

## [0.6.7] - 2020-03-27

- New `didConnect` function to support Blockstack Connect integration

## [0.6.6] - 2020-03-26

- Update documentation

## [0.6.5] - 2020-03-26

- New `authenticated` property returned by useBlockstack()

## [0.6.4] - 2019-11-22

- Example extracted to https://github.com/REBL-Stack/starter-app

## [0.6.3] - 2019-10-19

- Guard in `useFile` against concurrent operations on the same file.

## [0.6.0] - 2019-10-12

### Added

- `useFile` hook

### Changed

- Default export is `initBlockstack` instead of the `Blockstack` context provider object (breaking).

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.8] - 2026-07-09

### Added
- Wired the new SDK 1.0.8 features across all examples: `onReportApply` (curated report from the insertion preview modal), `updateTemplate` (feed existing EMR field content into generation), and optional `insertionPreviewClassNames`
- Added the React example to the root README (examples table, env-file table, quick start)

### Changed
- Updated `@omniloy/sofia-sdk` to `^1.0.8` in all examples
- `baseurl` is now optional for some newer keys (the endpoint is resolved automatically) and required otherwise — Omniloy provides the credentials and tells you which
- AngularJS: bumped the CDN script from `@0.0.10` to `@1.0.8`
- README/CLAUDE: documented the new callbacks, corrected the "custom DOM events" note (callbacks are JS properties; those events are not emitted), and reframed template `source` as custom masters provisioned by Omniloy

### Fixed
- AngularJS: switched the template attribute from the deprecated `toolsargs` to `template`

### Removed
- `wssurl` from all examples and env files — deprecated and ignored since SDK 1.0.7 (the transcription WebSocket URL is delivered by the settings API)


## [1.0.0] - 2026-02-03

### Changed
- Updated Sofia SDK to v1.0.0
- Renamed `toolsargs`/`toolsArgs` to `template`
- Removed deprecated properties: `sofiatitle`, `isonlychat`, `disableactions`, `disablegenerate`, `isscreenloading`, `transcriptorselectvalues`, `handleFill`, `toast`
- Renamed example directories: `angular-ts` to `angular`, `angular-js` to `angularjs`
- Unified dev console layout across all examples

## [0.0.9] - 2026-01-22

### Changed
- Updated Sofia SDK to v0.0.9

## [0.0.8] - 2026-01-22

### Changed
- Updated Sofia SDK to v0.0.8

## [0.0.7] - 2025-12-12

### Changed
- Updated Sofia SDK to v0.0.7

## [0.0.6] - 2025-12-02

### Changed
- Updated Sofia SDK to v0.0.6
- Fixed environment example files

## [0.0.5] - 2025-12-01

### Fixed
- Fixed examples configuration and environment setup
- Updated README documentation

## [0.0.4] - 2025-11-12

### Changed
- Updated Sofia SDK to v0.0.4
- Removed chat sources

## [0.0.3] - 2025-11-10

### Changed
- Updated Sofia SDK to v0.0.3

## [0.0.1] - 2025-11-06

### Added
- Initial release with integration examples for Vanilla TypeScript, Angular, and AngularJS

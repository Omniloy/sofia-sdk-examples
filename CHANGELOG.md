# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1.1] - 2026-11-24

### Added
- Activity stream wired in all examples (SDK 1.0.11+): the `onEvent` callback plus the `event-subscriptions` attribute (`eventSubscriptions` prop in React), with a new **SDK Events** log and counter in every dev console
- Optional `hisversion` attribute (SDK 1.0.13+) — the integrator's HIS/EMR version, sent as the `x-his-version` header — read from a new optional `hisVersion` field in each environment example file (`VITE_HIS_VERSION` in React)
- README: new "Compliance Features Driven by Patient Data" section documenting the consent indicator (`patientdata.signedConsent`, including `aiUse`), the under-age policy (warn / confirm / block from `patientdata.birthDate`) and the note confirmation pop-up (insertion preview), with a pointer in every example README; `signedConsent` added to the sample patient data of the Vanilla TS, Angular and AngularJS examples
- React: added to the Dependabot configuration

### Changed
- Updated `@omniloy/sofia-sdk` to `^1.1.1` in the bundled examples; AngularJS CDN script pinned to `@1.1.1`
- Angular: callbacks are assigned from `ngAfterViewInit` through a `@ViewChild` reference instead of polling `document.getElementById`; `NgZone.run()` wrappers removed (the SDK calls host callbacks back inside Angular's zone); template, template ID and patient data now reach the SDK only through the `[attr.*]` bindings
- Angular: production bundle budget raised to 14 MB (warning) / 16 MB (error) for the larger SDK bundle
- Dev consoles: the State Monitor's "Event Count" (which counted reports) is now "Reports Received", next to the new "SDK Events" counter
- README: the CDN snippet pins an exact version instead of `@latest`; documented `language` codes (`es`, `en_US`, `en_GB`, …)

### Removed
- Angular: `window.omniscribe*` global callbacks (removed from the SDK for security), the `handle-report` / `set-is-open` / `set-get-last-report` / `isopen-changed` DOM listeners (the SDK never emits those events), the `isopen` `MutationObserver`, and the Angular-only template summary block
- AngularJS: the same dead DOM listeners, and the unused `@omniloy/sofia-sdk`, `angular` and `angular-route` npm dependencies (all three are loaded from CDN)

## [1.0.9] - 2026-07-24

### Added
- Extras: per-category action buttons via `template-extras` (`templateExtras` in React) and the `handleExtras` callback, in all examples
- Optional `usermedicalspecialty` attribute (all-lowercase; replaces the camelCase `userMedicalSpecialty` from 1.0.8)

### Changed
- Updated `@omniloy/sofia-sdk` to `^1.0.9` in all examples
- Bundled examples register `<sofia-sdk>` explicitly with `customElements.define` (the package ships `sideEffects: false`)

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

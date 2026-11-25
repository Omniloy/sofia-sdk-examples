# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Public repository with working examples showing how to integrate the Sofia SDK (`@omniloy/sofia-sdk`) into different web frameworks. Each example is a dev playground with debug console, JSON editors, state monitors, and report tracking.

## Development Commands

Each example is independent (no monorepo workspaces). Always `cd` into the example directory first.

| Example | Install | Dev Server | Build | Port |
|---|---|---|---|---|
| `examples/vanilla-ts` | `npm install` | `npm run dev` | `npm run build` (tsc + vite) | 5173 |
| `examples/angular` | `npm install` | `npm start` (ng serve) | `npm run build` | 4200 |
| `examples/angularjs` | `npm install` | `npm run dev` (http-server) | N/A (static files) | 8000 |
| `examples/react` | `npm install` | `npm run dev` (vite) | `npm run build` (tsc + vite) | 5174 |

Angular also has `npm test` (Karma). The other examples have no test suites.

Root-level scripts (run from repo root):
- `npm run security` — runs both Trivy vulnerability scan and GitLeaks secret detection

## Architecture

### SDK Integration Pattern

Three examples integrate the `<sofia-sdk>` web component; the React example uses the SDK's React build:

- **vanilla-ts**: ES6 class (`SofIA`) in `src/components/SofIA.ts` manages the component lifecycle. Config loaded via `fetch('/assets/environment.json')` at runtime. Vite bundles the SDK.
- **angular**: Angular standalone component (`OmniscribeDemoComponent`) in `src/app/sofia.component.ts` with `[attr.*]` bindings; callbacks are assigned in `ngAfterViewInit` through a `@ViewChild('sofia')` reference (no `NgZone.run()` — the SDK calls host callbacks back inside Angular's zone). Config imported from `environment.ts`. Angular CLI bundles the SDK.

> **Custom element registration (vanilla-ts & angular):** the SDK package ships `"sideEffects": false`, so a bare `import '@omniloy/sofia-sdk'` gets tree-shaken out of production builds and `<sofia-sdk>` never registers. Both bundled examples import the `SofiaSDK` constructor in their entry point and call `customElements.define('sofia-sdk', SofiaSDK)` behind a `customElements.get` guard. A local `src/sofia-sdk.d.ts` declares the module because the package's root `exports` entry has no `types` condition.
- **angularjs**: AngularJS controller (`MainController`) in `src/app/controllers/MainController.js` with `$scope` bindings. Config loaded via `$http.get('assets/environment.json')`. SDK loaded from CDN via `<script>` tag (pinned to an exact version — currently `@1.1.1`, never `@latest`; no bundler, and no npm dependency on the SDK: `package.json` only has `http-server`). Has a retry mechanism for component initialization (3 attempts).
- **react**: React 19 functional component (`App`) in `src/App.tsx` that renders the `<Omniscribe>` React component from `@omniloy/sofia-sdk/react` (plus `@omniloy/sofia-sdk/react/index.css`) with props and `useState`/`useCallback` — no custom element. Config read from `import.meta.env.VITE_*` (`.env`). Vite bundles the SDK.

### Configuration Flow

Each example follows: load environment config → create `<sofia-sdk>` element → set HTML attributes (lowercase) → attach three required callbacks → append to DOM.

### Template Configuration

Template definitions live in separate files (each also exports the extras schema for SDK 1.0.9's per-category action buttons and the `onEvent` subscription list):
- `examples/vanilla-ts/src/utils/config.ts` — `TEMPLATE_CONFIG`, `TEMPLATE_EXTRAS_CONFIG` and `EVENT_SUBSCRIPTIONS` constants
- `examples/angular/src/app/template/Template.ts` — `Template`, `TemplateExtras` and `EventSubscriptions` exports
- `examples/angularjs/src/assets/template.js` — global `Template`, `TemplateExtras` and `EventSubscriptions` objects
- `examples/react/src/utils/config.ts` — `TEMPLATE_CONFIG`, `TEMPLATE_EXTRAS_CONFIG` and `EVENT_SUBSCRIPTIONS` constants

## SDK Property Naming

HTML attributes are **lowercase** (web component standard):
- `apikey`, `userid`, `patientid`
- `baseurl` (optional for some newer keys — the endpoint is resolved automatically since 1.0.8; required otherwise. Omniloy provides the credentials and tells you which)
- `template`, `templateid`, `patientdata`
- `isopen`, `language` (a language code: `es`, `en_US`, `en_GB`, `pt_BR`… — unsupported values are ignored), `debug`
- `usermedicalspecialty` (1.0.9+, optional — attached to tracked events for analytics. All-lowercase: the camelCase `userMedicalSpecialty` from 1.0.8 was renamed and is silently ignored)
- `template-extras` (1.0.9+, optional — JSON Schema for per-category extras action buttons; kebab-case attribute for the camelCase `templateExtras` JS property)
- `event-subscriptions` (1.0.11+, optional — JSON array of the events `onEvent` receives: exact names, family wildcards like `recording.*`, or `*`; kebab-case attribute for the camelCase `eventSubscriptions` JS property. Without it no events are delivered)
- `hisversion` (1.0.13+, optional — the integrator's HIS/EMR version, sent as the `x-his-version` header)

The SDK strips sensitive attributes (`apikey`, `userid`, `patientid`, `patientdata`, `baseurl`, `templateid`, `template`, `template-extras`) from the DOM right after reading them, so never read them back with `getAttribute`.

Function/JSON props are assigned as **JS properties** on the element (not HTML attributes): `handleReport`, `setIsOpen`, `setGetLastReport`, `onReportApply`, `updateTemplate`, `insertionPreviewClassNames`, `handleExtras`, `templateExtras`, `onEvent`, `eventSubscriptions`.

## Deprecated Properties

Do NOT use these in examples:

| Deprecated | Replacement |
|---|---|
| `wssurl` | Removed — deprecated & ignored since 1.0.7; the transcription WebSocket URL is delivered by the settings API |
| `toolsargs` / `toolsArgs` | `template` |
| `sofiatitle` / `sofiaTitle` | Remove (title is always "SofIA") |
| `isonlychat` / `onlyChat` | Auto-detected (omit `template`/`templateid` for chat-only) |
| `disableactions` | Don't mount the component |
| `disablegenerate` | Omit `template`/`templateid` |
| `isscreenloading` | Not available in Chat-based UI |
| `transcriptorselectvalues` | No effect |
| `render-report-content` | Not available in Chat-based UI |
| `handleFill` | Not available in Chat-based UI |
| `toast` | No effect |

## Report Generation

The generate button only appears when **both** `template` AND `templateid` are provided. Without them, SofIA operates in chat-only mode automatically.

## SDK Callbacks

Assign as **JS properties** on the `<sofia-sdk>` element (or as props on the React `<Omniscribe>` component):

```javascript
component.handleReport = (report) => { /* receives generated report (fallback delivery) */ };
component.setIsOpen = (valueOrFn) => { /* controls widget visibility */ };
component.setGetLastReport = (fn) => { /* exposes async function to retrieve last report */ };

// New in SDK 1.0.8
component.onReportApply = (curated) => { /* curated report from the insertion preview modal */ };
component.updateTemplate = () => ({ /* existing EMR content keyed by template property id */ });
component.insertionPreviewClassNames = { panel: '...' }; // optional modal styling

// New in SDK 1.0.9 — extras: per-category action buttons defined by the
// `template-extras` schema (one button per top-level property). Items are
// delivered exactly as the schema produced them — no field remapping.
component.handleExtras = (extras) => { /* items for the clicked category */ };

// SDK 1.0.11+ — activity stream: typed, PHI-free events ({ name, family, level,
// ts, seq, sdkVersion, sessionId, payload }) in four families: recording,
// activity, report, lifecycle. Only fires for what `event-subscriptions` asks for.
component.onEvent = (event) => { /* e.g. keep the session alive on 'recording.heartbeat' */ };
```

> **The SDK does NOT emit `handle-report` / `set-is-open` / `set-get-last-report` DOM events.** Use the callback **properties** above. The only real DOM event is `sofia:transcriber-url-changed`. The old `window.omniscribe*` global callbacks were removed from the SDK for security — do not reintroduce them.

## Template Field Properties

- `isConfigurable` (default: `true`) — controls whether the healthcare professional can edit the generated field
- `source` — links a field to a **custom master** (a controlled terminology / code catalog) that Omniloy provisions per account. There are no built-in `source` values; contact Omniloy to have a custom master created and receive its `source`. You can also request a terminology (e.g. ICD-10) directly in the field `description`.
- `mandatory` (custom keyword) — stronger than `required`: the doctor must review/fill it before Apply in the insertion preview modal

## Compliance Features (backend flags, no props)

Enabled per API key by Omniloy via the settings API and driven by `patientdata` — documented in the root README section "Compliance Features Driven by Patient Data":

- **Consent indicator** (`showConsentIndicator` flag) — `patientdata.signedConsent = { signed, date, aiUse? }` renders a header badge; `aiUse: 'refused'` (1.0.10+) blocks recording and report generation.
- **Minor policy** (`minorPolicy`: `off` | `warn` | `confirm` | `block`, `minorAgeThreshold` default 18; 1.0.10+) — age computed from `patientdata.birthDate` (ISO, `MM/DD/YYYY` or `DD/MM/YYYY`; ambiguous dates resolve to the youngest age; unparseable dates apply no restriction).
- **Insertion preview** (`showInsertionPreview` flag) — the note confirmation pop-up; curated note arrives via `onReportApply`, otherwise `handleReport`.

## Environment Configuration

Each example has an environment **example** file with placeholder values (the actual env files are gitignored):

| Example | Example file | Actual file (gitignored) |
|---|---|---|
| `vanilla-ts` | `public/assets/environment.example.json` | `public/assets/environment.json` |
| `angular` | `environment.example.ts` | `environment.ts` |
| `angularjs` | `src/assets/environment.example.json` | `src/assets/environment.json` |
| `react` | `.env.example` | `.env` |

For AngularJS, copy `src/assets/environment.example.json` to `src/assets/environment.json` and fill in your credentials.

## UI Consistency

All four examples must share the same visual design and dev console layout:

1. **Header**: Omniloy logo + "SofIA SDK - [Framework Name]" + link to docs
2. **Main Area**: `<sofia-sdk>` component
3. **Dev Console**:
   - SDK Runtime Controls: Open/Close, Get Last Report
   - SDK State Monitor: Component status, SDK state, report handler, reports received, SDK events count
   - Template Editor: JSON editor for `template` with validation
   - Template ID: Text input for `templateid`
   - Debug Toggle: Checkbox for `debug` attribute
   - Patient Data Editor: JSON editor for `patientdata` with validation
   - SDK Events: log of the events delivered to `onEvent` (newest first, capped at 50) with a Clear button
   - Report Display: Shows received reports (including curated reports from `onReportApply` and extras from `handleExtras`)

The dev console does **NOT** include: Title editor (deprecated), Only Chat toggle (deprecated).

## Source of Truth

- **SDK documentation**: [https://omniloy.mintlify.app/en](https://omniloy.mintlify.app/en)

## Security

- Secret scanning and vulnerability scanning are configured via pre-commit hooks
- Never commit real API keys or credentials — use placeholder values in example files

## Testing Checklist

For each example (`vanilla-ts`, `angular`, `angularjs`, `react`):

1. `npm install` completes without errors
2. Dev server starts (`npm run dev` / `npm start`)
3. No deprecated props in source code (no `wssurl`, no `toolsargs`)
4. `template` and `templateid` props are both set on `<sofia-sdk>`
5. Environment example file has correct structure
6. Dev console has: Template editor, Patient Data editor, templateid input, debug toggle
7. Dev console does NOT have: Title editor, Only Chat toggle
8. `handleReport`, `setIsOpen`, `setGetLastReport`, `onReportApply`, `updateTemplate`, `handleExtras`, `onEvent` callbacks are correctly wired, the extras schema is passed via `template-extras` (attribute) / `templateExtras` (React prop), and the event subscription via `event-subscriptions` / `eventSubscriptions` (a `lifecycle.ready` event shows up in the SDK Events log on load)
9. No hardcoded API keys or credentials in source
10. README instructions work end-to-end

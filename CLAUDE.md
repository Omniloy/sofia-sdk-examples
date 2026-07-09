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

All examples integrate the same `<sofia-sdk>` web component with three different approaches:

- **vanilla-ts**: ES6 class (`SofIA`) in `src/components/SofIA.ts` manages the component lifecycle. Config loaded via `fetch('/assets/environment.json')` at runtime. Vite bundles the SDK.
- **angular**: Angular standalone component (`OmniscribeDemoComponent`) in `src/app/sofia.component.ts` with `[attr.*]` bindings. Config imported from `environment.ts`. Angular CLI bundles the SDK.
- **angularjs**: AngularJS controller (`MainController`) in `src/app/controllers/MainController.js` with `$scope` bindings. Config loaded via `$http.get('assets/environment.json')`. SDK loaded from CDN via `<script>` tag (pinned to `@1.0.8`, no bundler). Has a retry mechanism for component initialization (3 attempts).
- **react**: React 19 functional component (`App`) in `src/App.tsx` with `useRef` and `useEffect`. Config loaded via `fetch('/assets/environment.json')` at runtime. Vite bundles the SDK.

### Configuration Flow

Each example follows: load environment config → create `<sofia-sdk>` element → set HTML attributes (lowercase) → attach three required callbacks → append to DOM.

### Template Configuration

Template definitions live in separate files:
- `examples/vanilla-ts/src/utils/config.ts` — `TEMPLATE_CONFIG` constant
- `examples/angular/src/app/template/Template.ts` — default export
- `examples/angularjs/src/assets/template.js` — global `Template` object
- `examples/react/src/utils/config.ts` — `TEMPLATE_CONFIG` constant

## SDK Property Naming

HTML attributes are **lowercase** (web component standard):
- `apikey`, `userid`, `patientid`
- `baseurl` (optional for some newer keys — the endpoint is resolved automatically since 1.0.8; required otherwise. Omniloy provides the credentials and tells you which)
- `template`, `templateid`, `patientdata`
- `isopen`, `language`, `debug`

Function/JSON props are assigned as **JS properties** on the element (not HTML attributes): `handleReport`, `setIsOpen`, `setGetLastReport`, `onReportApply`, `updateTemplate`, `insertionPreviewClassNames`.

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
```

> **The SDK does NOT emit `handle-report` / `set-is-open` / `set-get-last-report` DOM events.** Use the callback **properties** above. The only real DOM event is `sofia:transcriber-url-changed`.

## Template Field Properties

- `isConfigurable` (default: `true`) — controls whether the healthcare professional can edit the generated field
- `source` — links a field to a **custom master** (a controlled terminology / code catalog) that Omniloy provisions per account. There are no built-in `source` values; contact Omniloy to have a custom master created and receive its `source`. You can also request a terminology (e.g. ICD-10) directly in the field `description`.
- `mandatory` (custom keyword) — stronger than `required`: the doctor must review/fill it before Apply in the insertion preview modal

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
   - SDK Runtime Controls: Open/Close, Get Last Report, Clear Reports, Reload
   - SDK State Monitor: Component status, SDK state, report handler, event count
   - Template Editor: JSON editor for `template` with validation
   - Template ID: Text input for `templateid`
   - Debug Toggle: Checkbox for `debug` attribute
   - Patient Data Editor: JSON editor for `patientdata` with validation
   - Report Display: Shows received reports

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
8. `handleReport`, `setIsOpen`, `setGetLastReport`, `onReportApply`, `updateTemplate` callbacks are correctly wired
9. No hardcoded API keys or credentials in source
10. README instructions work end-to-end

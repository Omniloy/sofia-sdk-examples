# SofIA SDK - AngularJS

Integration example for the SofIA SDK using AngularJS 1.8.3 (legacy support). This example demonstrates how to embed the SofIA web component in a classic AngularJS application with dynamic configuration, template editing, and a debug console.

Documentation: <https://omniloy.mintlify.app/en>

## Prerequisites

- **Node.js** >= 18.x (22+ recommended, see `.nvmrc`)
- **npm** >= 8.x
- Modern browser with Custom Elements support

## Quick Start

### 1. Configure Environment

Copy the example environment file and fill in your credentials:

```bash
cp src/assets/environment.example.json src/assets/environment.json
```

Edit `src/assets/environment.json`:

```json
{
  "apiKey": "YOUR_API_KEY",
  "baseUrl": "",
  "userId": "YOUR_DEFAULT_USER_ID",
  "patientId": "YOUR_DEFAULT_PATIENT_ID",
  "templateId": "YOUR_TEMPLATE_ID",
  "userMedicalSpecialty": "",
  "hisVersion": "",
  "language": "es",
  "isOpen": true,
  "debug": true
}
```

> **`baseUrl` is optional.** For some newer keys the endpoint is resolved automatically, so you can leave `baseUrl` empty; other keys require it. Omniloy provides your credentials and tells you which. The deprecated `wssUrl` is no longer needed — the transcription URL is provided by the API.

### 2. Install and Run

```bash
npm install
npm run dev
```

Navigate to `http://localhost:8000`.

## SDK Loading

The SofIA SDK is loaded via CDN in `src/index.html` (pinned to v1.1.1) before AngularJS so that the `<sofia-sdk>` custom element is registered when Angular compiles the template:

```html
<script src="https://unpkg.com/@omniloy/sofia-sdk@1.1.1/dist/webcomponents.umd.js"></script>
```

The AngularJS and angular-route CDN scripts use Subresource Integrity (SRI) hashes. The SofIA SDK script is version-pinned; always pin it to an exact version (never `@latest`) so a new release only reaches your users after you have tested it.

Nothing is installed from npm at runtime: `npm install` only brings `http-server` to serve the static files.

## SDK Attributes

The `<sofia-sdk>` element accepts the following attributes:

| Attribute               | Description                                                     |
|------------------------|------------------------------------------------------------------|
| `patientid`            | Patient identifier                                               |
| `userid`               | User / practitioner identifier                                   |
| `templateid`           | Template identifier for clinical notes                           |
| `apikey`               | API key for authentication (provided by Omniloy) |
| `baseurl`              | Base URL of the SofIA API — **optional**, only for legacy keys   |
| `isopen`               | Whether the widget starts open                                   |
| `language`             | Interface language code (e.g., `es`, `en_US`, `en_GB`, `pt_BR`); unsupported values are ignored |
| `template`             | JSON string with the template schema                             |
| `patientdata`          | JSON string with patient context                                 |
| `debug`                | Enable debug mode (console output)                               |
| `usermedicalspecialty` | (1.0.9+) Doctor's specialty, attached to tracked events — optional |
| `template-extras`      | (1.0.9+) JSON Schema defining per-category extras action buttons (requires `handleExtras`) |
| `event-subscriptions`  | (1.0.11+) JSON array of the events `onEvent` receives (`"recording.*"`, `"*"`, …). Without it no events are delivered |
| `hisversion`           | (1.0.13+) Version of your HIS/EMR, sent as the `x-his-version` header — optional |

## Minimal Integration

Copy-paste this to integrate the Sofia SDK into any AngularJS project. See the code between `SDK INTEGRATION START` and `SDK INTEGRATION END` in `src/app/controllers/MainController.js` for the full working version.

**1. Load the SDK** via CDN in your HTML (before AngularJS):

```html
<script src="https://unpkg.com/@omniloy/sofia-sdk@1.1.1/dist/webcomponents.umd.js"></script>
```

**2. Add the component** in your template:

```html
<sofia-sdk id="sofia-component"
  patientid="{{patientId}}"
  userid="{{userId}}"
  templateid="{{templateId}}"
  apikey="{{apiKey}}"
  isopen="{{isOpen}}"
  language="{{language}}"
></sofia-sdk>
```

**3. Set the callbacks** in your controller:

```javascript
var component = document.getElementById('sofia-component');

component.handleReport = function(report) {
  $scope.$evalAsync(function() {
    $scope.lastReport = report;
  });
};

component.setIsOpen = function(valueOrFn) {
  $scope.$evalAsync(function() {
    $scope.isOpen = typeof valueOrFn === 'function' ? valueOrFn($scope.isOpen) : valueOrFn;
  });
};

component.setGetLastReport = function(fn) {
  $scope.getLastReportFn = fn;
};
```

## Required Callbacks

Three callbacks must be set on the `<sofia-sdk>` element as properties:

```javascript
component.handleReport = function(report) {
  // Called when a report is generated (fallback when the insertion preview is off)
};

component.setIsOpen = function(valueOrFn) {
  // Controls widget visibility — receives a boolean or a toggle function
};

component.setGetLastReport = function(fn) {
  // Receives an async function to retrieve the last report
};
```

Assign these as **element properties** (as above) — the SDK does not emit `handle-report` / `set-is-open` DOM events, so Angular/DOM event bindings won't fire.

## New in v1.0.8: insertion preview & EMR pre-fill

Three optional properties, also assigned on the element (see `setupSofIAComponent` in `MainController.js`):

```javascript
// Insertion preview modal — the doctor reviews/curates the report before it is applied.
// Enabled per API key on the backend; when off, reports arrive via handleReport instead.
component.onReportApply = function(curated) {
  // Receives the curated report the doctor approved
};

// EMR pre-fill — feed already-typed field content into generation so regeneration
// integrates it instead of overwriting it. Keys must match template property ids.
component.updateTemplate = function() {
  return { reason_for_consultation: '...', treatment_plan: '...' };
};

// Optional: style the insertion preview modal (lives in the SDK shadow DOM).
component.insertionPreviewClassNames = { panel: 'sofia-preview-panel' };
```

See the docs: [Insertion preview](https://omniloy.mintlify.app/en/sofia/en/sdk/insertion-preview) and [updateTemplate](https://omniloy.mintlify.app/en/sofia/en/sdk/update-template).

## New in v1.0.9: extras (per-category action buttons)

Provide a JSON Schema via the `template-extras` attribute (see `window.TemplateExtras` in `src/assets/template.js`); each top-level property (appointments, tests, referrals, …) renders one button in the SDK chat footer. Clicking a button extracts only that category from the transcript and delivers the items to `handleExtras` exactly as the schema produced them — no field remapping:

```javascript
component.setAttribute('template-extras', JSON.stringify(window.TemplateExtras));

component.handleExtras = function(extras) {
  // e.g. [{ type: 'laboratory', description: 'Complete blood panel' }]
  $scope.$evalAsync(function() { $scope.lastExtras = extras; });
};
```

v1.0.9 also adds the optional `usermedicalspecialty` attribute (all-lowercase — the camelCase `userMedicalSpecialty` from v1.0.8 was renamed and is now silently ignored).

## Activity events (v1.0.11+)

`onEvent` receives typed, PHI-free events about what happens inside the widget. Subscription is explicit — without the `event-subscriptions` attribute nothing is delivered (see `window.EventSubscriptions` in `src/assets/template.js`):

```javascript
component.setAttribute('event-subscriptions', JSON.stringify(['recording.*', 'report.*'])); // or ['*']

component.onEvent = function(event) {
  if (event.name === 'recording.heartbeat') session.keepAlive(); // every ~30s while audio flows
  $scope.$evalAsync(function() { $scope.lastSdkEvent = event; });
};
```

Event families: `recording` (`started`, `stopped`, `audio_lost`, `microphone_disconnected`, `heartbeat`), `activity` (`interaction`, `typing`), `report` (`generation_started`, `settled`) and `lifecycle` (`ready`, `closed`). Each event carries `{ name, family, level, ts, seq, sdkVersion, sessionId, payload }`; payloads hold only enums, booleans and numbers — never clinical text or identifiers. Typical use: drive your inactivity timeout, and never close the widget between `report.generation_started` and `report.settled`.

The optional `hisversion` attribute (v1.0.13+) sends the version of your HIS/EMR as the `x-his-version` header on every request.

## Consent, Minors and the Note Confirmation Pop-up

Three behaviours are enabled per API key by Omniloy and driven by `patientdata` — no extra props:

- **Consent indicator** — `patientdata.signedConsent` (`{ signed, date, aiUse? }`) shows a *Signed / Unsigned consent* badge in the SDK header; `aiUse: 'refused'` blocks recording and report generation.
- **Under-age patients** — the SDK computes the age from `patientdata.birthDate` (prefer ISO `YYYY-MM-DD`) and, depending on the policy configured for your key, shows a **warning**, asks the doctor to **confirm**, or **blocks** recording and report generation.
- **Note confirmation pop-up (insertion preview)** — the doctor reviews and curates the generated note before it reaches your app; the result arrives via `onReportApply` instead of `handleReport`.

Full details in the [root README](../../README.md#compliance-features-driven-by-patient-data). The sample patient data in this example includes `signedConsent` so you can see the indicator once it is enabled for your key.

## Features

- **Template editor** -- edit the template schema JSON live with validation.
- **Template ID** -- change the active template ID at runtime.
- **Patient data editor** -- modify patient context on the fly.
- **Debug toggle** -- enable verbose console output from the SDK.
- **Runtime controls** -- open/close the widget and fetch the last report.
- **State monitor** -- view component mount status, SDK state, reports received and SDK event count.
- **SDK events** -- live log of the activity events delivered to `onEvent`.

## Project Structure

```
src/
  app/
    app.js                        # AngularJS module and routing
    controllers/
      MainController.js           # SDK integration logic
    views/
      main.html                   # Template with debug console
  assets/
    environment.json              # Runtime configuration (gitignored)
    environment.example.json      # Configuration template
    template.js                   # Default template, extras schema and event subscriptions
    logo.svg                      # Omniloy logo
  index.html                      # Entry point with CDN script
  index.css                       # Styles
```

## Related Examples

- [Vanilla TypeScript](../vanilla-ts/) -- framework-free implementation
- [Angular](../angular/) -- modern Angular implementation

---

Need help? Check the [documentation](https://omniloy.mintlify.app/en) or contact Omniloy support.

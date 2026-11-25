# Sofia SDK Examples

![Examples](https://img.shields.io/badge/Examples-4-orange)
![License](https://img.shields.io/badge/License-MIT-green)
![SDK Version](https://img.shields.io/badge/SDK-v1.1.1-blue)

Quick examples showing how to integrate **Sofia SDK** (`@omniloy/sofia-sdk`) into different web frameworks. Pick your framework and get started in minutes!

## Available Examples

| Framework | Description | Directory |
|-----------|-------------|-----------|
| **React** | React 19 + TypeScript with Vite (uses the `<Omniscribe>` component) | [`/examples/react`](./examples/react/) |
| **Vanilla TypeScript** | Plain TypeScript with Vite | [`/examples/vanilla-ts`](./examples/vanilla-ts/) |
| **Angular** | Angular 19+ integration | [`/examples/angular`](./examples/angular/) |
| **AngularJS** | Legacy AngularJS support | [`/examples/angularjs`](./examples/angularjs/) |

## Prerequisites

- **Node.js** >= 22.12 (see `.nvmrc`; required by Vite 7 and Angular 19)
- **npm** >= 8.x
- Modern browser with Custom Elements support

## Quick Start

1. **Clone and navigate:**
   ```bash
   git clone https://github.com/omniloy/sofia-sdk-examples.git
   cd sofia-sdk-examples
   ```

2. **Choose your example:**
   ```bash
   cd examples/react    # or examples/vanilla-ts, examples/angular, examples/angularjs
   ```

3. **Configure credentials** (see [Getting Credentials](#getting-credentials) below):
   ```bash
   # React — copy the example env file
   cp .env.example .env

   # Vanilla TS / AngularJS — copy the example env file
   cp public/assets/environment.example.json public/assets/environment.json

   # Angular — copy the example env file
   cp environment.example.ts environment.ts
   ```

4. **Run:**
   ```bash
   npm install
   npm start
   ```

## Configuration

### Getting Credentials

Before running any example, you need API credentials from Omniloy:

1. **Request access** — contact the Omniloy team:
   - Email: [enrique.alcazar@omniloy.com](mailto:enrique.alcazar@omniloy.com)
   - Website: [omniloy.com](https://omniloy.com)

2. **You will receive:**
   | Credential | Description | Example format |
   |---|---|---|
   | `apiKey` | Authentication key | `YOUR_API_KEY` |
   | `userId` | Your user identifier | `user-123` |
   | `patientId` | Patient context for testing | `patient-456` |
   | `templateId` | Template identifier | `tpl-789` |
   | `baseUrl` | Sofia API endpoint (**optional** for some keys — Omniloy tells you) | `https://api.example.com/v1` |

> **API key & baseUrl**: Omniloy provides your credentials. `baseUrl` is optional for some newer keys (the endpoint is resolved automatically) and required otherwise — Omniloy tells you which. The `wssUrl` credential is no longer used — the transcription WebSocket URL is provided automatically by the settings API (the `wssurl` prop is deprecated and ignored since SDK 1.0.7).

> **Note**: If credentials are left as placeholder values (`YOUR_API_KEY`, etc.), the examples will show a configuration error at startup.

### Environment Files

Each example has an `.example` file you copy and fill in:

| Example | Copy from | To (gitignored) |
|---|---|---|
| React | `.env.example` | `.env` |
| Vanilla TS | `public/assets/environment.example.json` | `public/assets/environment.json` |
| Angular | `environment.example.ts` | `environment.ts` |
| AngularJS | `src/assets/environment.example.json` | `src/assets/environment.json` |

### Required Parameters

```typescript
{
  // Credentials from Omniloy
  apiKey: 'YOUR_API_KEY',        // Authentication key (provided by Omniloy)
  baseUrl: 'https://api.example.com/v1', // Sofia API endpoint — optional for some keys (Omniloy tells you)

  // Your application data
  userId: 'user-123',                    // User identifier (internal surrogate id, never PII)
  patientId: 'patient-456',             // Patient context (internal surrogate id, never PII)

  // Template configuration (both required for report generation)
  template: {},                          // JSON Schema template
  templateId: 'tpl-789',                // Template identifier

  // Optional configuration
  isOpen: true,                          // Show/hide component
  language: 'es',                        // Interface language code: es, en_US, en_GB, pt_BR, pt_PT, fr, ca… (unsupported values are ignored)
  debug: true,                           // Enable debug logging
  userMedicalSpecialty: 'cardiology',    // Doctor's specialty, attached to analytics events (`usermedicalspecialty`)
  hisVersion: '5.2.1',                   // Your HIS/EMR version, sent as the x-his-version header (`hisversion`)
}
```

> `wssUrl` is no longer part of the configuration — the transcription WebSocket URL is delivered by the settings API (the `wssurl` prop is deprecated and ignored since SDK 1.0.7).

### Available Callbacks

Set these as **JS properties** on the `<sofia-sdk>` element (or as props on the React `<Omniscribe>` component):

```javascript
// Handle generated reports (fallback delivery when the insertion preview modal is off)
component.handleReport = (report) => {
  console.log('Report received:', report);
};

// Handle visibility changes
component.setIsOpen = (isOpen) => {
  console.log('Component visibility:', isOpen);
};

// Get reference to retrieve last report
component.setGetLastReport = (fn) => {
  // Store fn to call later: fn() returns the last report
};

// NEW (SDK 1.0.8) — receive the curated report from the insertion preview modal.
// The modal is opt-in per API key (enabled by Omniloy on the backend); until then, reports arrive via handleReport.
component.onReportApply = (curated) => {
  console.log('Curated report applied:', curated);
};

// NEW (SDK 1.0.8) — feed the doctor's existing EMR field content into generation so
// regeneration produces a revised note instead of an identical copy. Keys must match template property ids.
component.updateTemplate = () => ({
  chief_complaint: 'Chest pain for 2 days',
});

// NEW (SDK 1.0.8, optional) — class-name overrides to style the insertion preview modal.
component.insertionPreviewClassNames = { panel: 'my-preview-panel' };

// NEW (SDK 1.0.9) — extras: per-category action buttons (appointments, tests, referrals, …).
// Provide a JSON Schema via the `template-extras` attribute (or `templateExtras` prop in React);
// each top-level property renders one button in the SDK chat footer. Clicking a button extracts
// only that category from the transcript and delivers the items EXACTLY as the schema produced
// them — no field remapping.
component.setAttribute('template-extras', JSON.stringify(templateExtras));
component.handleExtras = (extras) => {
  console.log('Extras:', extras); // e.g. [{ type: 'laboratory', description: 'Complete blood panel' }]
};

// SDK 1.0.11+ — activity stream: typed, PHI-free events about what happens inside the widget
// (recording, user activity, report generation, lifecycle). Subscription is explicit: without
// `event-subscriptions` (`eventSubscriptions` prop in React) nothing is delivered.
component.setAttribute('event-subscriptions', JSON.stringify(['recording.*', 'report.*'])); // or ['*']
component.onEvent = (event) => {
  if (event.name === 'recording.heartbeat') session.keepAlive(); // every ~30s while audio flows
};
```

> **Activity events (`onEvent`).** Event families: `recording` (`started`, `stopped`, `audio_lost`, `microphone_disconnected`, `heartbeat`), `activity` (`interaction`, `typing`), `report` (`generation_started`, `settled`) and `lifecycle` (`ready`, `closed`). Each event carries `{ name, family, level, ts, seq, sdkVersion, sessionId, payload }`; payloads hold only enums, booleans and numbers — never clinical text or identifiers. Typical use: drive your inactivity timeout — keep the session alive on `recording.heartbeat`, and never close the widget between `report.generation_started` and `report.settled` (generation runs for tens of seconds with no user input).

> **`hisversion` (SDK 1.0.13+):** optional attribute with the version of your HIS/EMR (e.g. `"5.2.1"`), sent as the `x-his-version` header on every request. Printable ASCII only, max 64 characters.

> **New in SDK 1.0.9:** the optional `usermedicalspecialty` attribute attaches the doctor's specialty to tracked events for analytics. Note the all-lowercase name — the camelCase `userMedicalSpecialty` that shipped in 1.0.8 was renamed and is now silently ignored (breaking change for React hosts using the old spelling).

See the [Insertion preview](https://omniloy.mintlify.app/sofia/en/sdk/insertion-preview) and [updateTemplate](https://omniloy.mintlify.app/sofia/en/sdk/update-template) guides for the full flow.

## Compliance Features Driven by Patient Data

Three behaviours are switched on **per API key by Omniloy** (there is no prop for them) and are driven by what you send in `patientdata`. Ask Omniloy to enable them for your key.

```typescript
patientdata = {
  fullName: 'John Doe',
  birthDate: '1980-01-15',          // drives the under-age rule (see below)
  phone: '+1 555-123-4567',
  address: '123 Main St, Example City, USA',
  extraData: { /* free-form clinical context */ },
  signedConsent: {
    signed: true,                   // has the patient signed the consent form?
    date: '2025-03-01',             // shown in the indicator tooltip
    aiUse: 'accepted',              // optional (SDK 1.0.10+): 'accepted' | 'refused' | 'pending'
  },
};
```

### Consent indicator (`signedConsent`)

When the consent indicator is enabled for your key **and** `patientdata.signedConsent` is present, the SDK header shows a badge:

| `signedConsent` | Badge | Effect |
|---|---|---|
| `signed: true` | **Signed consent** | The doctor can record the conversation without mentioning AI during the consultation |
| `signed: false` | **Unsigned consent** | The tooltip tells the doctor the consultation can be recorded as dictation |
| `aiUse: 'refused'` | **AI use refused** | **Recording and report generation are blocked** for this consultation (the chat stays available) |

`aiUse` is optional: absent or `'pending'` keeps the normal flow; only an explicit `'refused'` blocks. Without `signedConsent` no badge is shown.

### Under-age patients (block / confirm / warn)

Omniloy configures a minor policy per API key, plus the age threshold (default **18**). The SDK computes the patient's age from `patientdata.birthDate` and applies the policy when the doctor starts a recording or a report:

| Policy | What the doctor sees |
|---|---|
| `off` (default) | Nothing — the flow is untouched |
| `warn` | A notice that the patient is a minor and that using the assistant requires authorisation from the holder of parental authority or legal guardianship. One button to acknowledge, then the action continues |
| `confirm` | The same notice with **Cancel** and a confirm button — the action only continues if the doctor confirms (the confirmation is audited) |
| `block` | Recording and report generation are disabled for this patient, with the reason in the tooltip and in the header badge (**Recording blocked**) |

`birthDate` accepts ISO (`1990-01-31`), `MM/DD/YYYY` and `DD/MM/YYYY`. When a numeric date is ambiguous (`03/04/2010`) the SDK takes the reading that gives the **youngest** age, so prefer ISO. If `birthDate` is missing or cannot be parsed (two-digit years, month names, timestamps), no restriction is applied. When several rules apply, the most restrictive one wins — a refused consent or a `block` policy always beats a warning.

### Note confirmation pop-up (insertion preview)

When the insertion preview is enabled for your key (and a `template` is set), a generated note is **not** delivered straight to `handleReport`. Instead the SDK opens a pop-up where the doctor reviews the note, selects/edits the fields to keep (fields marked `mandatory` in the template must be reviewed) and clicks **Apply**. Only then does your app receive the curated note, through **`onReportApply`**. With the feature off, notes keep arriving through `handleReport` — wire both callbacks. Style the pop-up with `insertionPreviewClassNames`, and feed existing EMR content into it with `updateTemplate`.

## Installation Options

### Option 1: NPM Package (Recommended)
```bash
npm install @omniloy/sofia-sdk
```

### Option 2: CDN
```html
<script src="https://unpkg.com/@omniloy/sofia-sdk@1.1.1/dist/webcomponents.umd.js"></script>
```

> **Always pin an exact version** (in the script URL or in `package.json`), never `@latest`: with `@latest` every release reaches your users the moment it is published. Upgrade by changing the version after testing it.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| `Configuration Error` at startup | Placeholder credentials not replaced | Copy the `.example` env file and fill in real credentials (see [Getting Credentials](#getting-credentials)) |
| Component not loading | SDK not installed, or the import was tree-shaken | Run `npm install`. In bundled apps import `SofiaSDK` and call `customElements.define('sofia-sdk', SofiaSDK)` — the package ships `sideEffects: false`, so a bare `import '@omniloy/sofia-sdk'` is dropped from production builds |
| No generate button | Missing `template` or `templateid` | Both `template` AND `templateid` must be set for report generation |
| Callbacks not firing | Bound as DOM events or HTML attributes | Assign `handleReport`, `setIsOpen`, `setGetLastReport`, `onReportApply`, `updateTemplate`, `handleExtras`, `onEvent` as **JS properties** on the element — the SDK emits no DOM events for them |
| `onEvent` never fires | No subscription | Set `event-subscriptions` (`eventSubscriptions` in React), e.g. `["*"]` — without it no events are delivered |
| Boolean attributes ignored | Using boolean instead of string | Use strings: `setAttribute('isopen', 'true')`, not booleans |
| Recording / generate button disabled, header says "Recording blocked" or "AI use refused" | Compliance rule | Your key has the minor policy set to `block` and `patientdata.birthDate` is under the threshold, or `patientdata.signedConsent.aiUse` is `'refused'`. See [Compliance Features](#compliance-features-driven-by-patient-data) |
| Insertion preview modal never appears | Backend flag off, or no `template` | The modal is opt-in per API key — ask Omniloy to enable it. It also requires a `template`. Until enabled, reports arrive via `handleReport` |
| Transcription doesn't start | Settings not resolved yet | The transcription URL is provided by the settings API (not `wssUrl` anymore); recording stays disabled until it resolves. Verify your `apiKey` is valid |

For framework-specific troubleshooting, see each example's README.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on reporting bugs, suggesting features, and submitting pull requests.

## Security

See [SECURITY.md](./SECURITY.md) for our security policy and how to report vulnerabilities.

## License

Examples are MIT licensed. Sofia itself is dual-licensed (AGPLv3/Commercial).

For commercial use, [contact us](mailto:enrique.alcazar@omniloy.com).

## Resources

- [Sofia SDK Docs](https://omniloy.mintlify.app/en)
- [Report Issues](https://github.com/omniloy/sofia-sdk-examples/issues)

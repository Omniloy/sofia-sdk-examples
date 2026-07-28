# Sofia SDK Examples

![Examples](https://img.shields.io/badge/Examples-4-orange)
![License](https://img.shields.io/badge/License-MIT-green)
![SDK Version](https://img.shields.io/badge/SDK-v1.0.9-blue)

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
  language: 'en',                        // Interface language
  debug: true,                           // Enable debug logging
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
```

> **New in SDK 1.0.9:** the optional `usermedicalspecialty` attribute attaches the doctor's specialty to tracked events for analytics. Note the all-lowercase name — the camelCase `userMedicalSpecialty` that shipped in 1.0.8 was renamed and is now silently ignored (breaking change for React hosts using the old spelling).

See the [Insertion preview](https://omniloy.mintlify.app/sofia/en/sdk/insertion-preview) and [updateTemplate](https://omniloy.mintlify.app/sofia/en/sdk/update-template) guides for the full flow.

## Installation Options

### Option 1: NPM Package (Recommended)
```bash
npm install @omniloy/sofia-sdk
```

### Option 2: CDN
```html
<script src="https://unpkg.com/@omniloy/sofia-sdk@latest/dist/webcomponents.umd.js"></script>
```

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| `Configuration Error` at startup | Placeholder credentials not replaced | Copy the `.example` env file and fill in real credentials (see [Getting Credentials](#getting-credentials)) |
| Component not loading | SDK not installed or not imported | Run `npm install` and ensure your entry point imports `@omniloy/sofia-sdk` |
| No generate button | Missing `template` or `templateid` | Both `template` AND `templateid` must be set for report generation |
| Callbacks not firing | Assigned before element exists | Assign `handleReport`, `setIsOpen`, `setGetLastReport`, `onReportApply`, `updateTemplate` after the element is in the DOM |
| Boolean attributes ignored | Using boolean instead of string | Use strings: `setAttribute('isopen', 'true')`, not booleans |
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

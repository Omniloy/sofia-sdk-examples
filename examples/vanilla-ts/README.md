# SofIA SDK - Vanilla TypeScript

This project demonstrates how to integrate the **SofIA SDK** (a web component) into a plain TypeScript application using **Vite**, without requiring any framework.

## What this example shows

- SofIA SDK integration in vanilla TypeScript
- Dynamic configuration with real-time debugging tools
- Complete development environment with SDK controls
- Event handling and state management
- Running with Vite + TypeScript 5.8

## Setup

### Prerequisites

- Node.js >= 22.12 (required by Vite 7)
- npm >= 8.x
- Modern browser with Custom Elements support

### Configuration

Copy `public/assets/environment.example.json` to `public/assets/environment.json` and fill in your credentials:

```bash
cp public/assets/environment.example.json public/assets/environment.json
```

```json
{
  "production": false,
  "sdk": {
    "apiKey": "YOUR_API_KEY",
    "userId": "YOUR_DEFAULT_USER_ID",
    "patientId": "YOUR_DEFAULT_PATIENT_ID",
    "templateId": "YOUR_TEMPLATE_ID",
    "userMedicalSpecialty": "",
    "hisVersion": "",
    "language": "es",
    "isOpen": true,
    "debug": true
  }
}
```

> **Important**: Replace placeholder values with actual credentials provided by Omniloy.
>
> **`baseUrl` is optional (SDK 1.0.8+).** For some newer keys the endpoint is resolved automatically, so you can leave `baseUrl` empty; other keys require it. Omniloy provides your credentials and tells you which. The `wssUrl` field was **removed** — the transcription WebSocket URL is now provided by the API (the `wssurl` prop is deprecated and ignored since 1.0.7).

### Installation & Run

```bash
npm install
npm run dev
```

Then open: http://localhost:5173

## Minimal Integration

Copy-paste this snippet to integrate the Sofia SDK into any vanilla TypeScript/JavaScript project. See the code between `SDK INTEGRATION START` and `SDK INTEGRATION END` in `src/components/SofIA.ts` for the full working version.

```typescript
import { SofiaSDK } from '@omniloy/sofia-sdk';

// Register the element explicitly — the package ships `sideEffects: false`, so a
// bare `import '@omniloy/sofia-sdk'` is tree-shaken out of production builds.
if (!customElements.get('sofia-sdk')) {
  customElements.define('sofia-sdk', SofiaSDK);
}

// 1. Create and configure the component
const component = document.createElement('sofia-sdk');

component.setAttribute('apikey', 'YOUR_API_KEY');
component.setAttribute('userid', 'user-123');
component.setAttribute('patientid', 'patient-456');
component.setAttribute('templateid', 'tpl-789');
component.setAttribute('template', JSON.stringify(myTemplate));
component.setAttribute('isopen', 'true');
component.setAttribute('language', 'es');
// baseurl is optional — set it only if Omniloy tells you your key needs it:
// component.setAttribute('baseurl', 'https://api.example.com/v1');

// 2. Set required callbacks
component.handleReport = (report) => {
  console.log('Report received:', report);
};

component.setIsOpen = (valueOrFn) => {
  const newState = typeof valueOrFn === 'function' ? valueOrFn(currentIsOpen) : valueOrFn;
  currentIsOpen = newState;
  component.setAttribute('isopen', String(newState));
};

component.setGetLastReport = (fn) => {
  getLastReport = fn; // store for later: await getLastReport()
};

// 3. (SDK 1.0.8+) Insertion preview + EMR pre-fill callbacks
component.onReportApply = (curated) => {
  // Curated report from the insertion preview modal (falls back to handleReport when disabled)
  console.log('Curated report:', curated);
};

component.updateTemplate = () => ({
  // Existing EMR content keyed by template property id — merged into generation
  reason_for_consultation: 'Follow-up for hypertension',
});

// 4. (SDK 1.0.9) Extras — per-category action buttons (appointments, tests, referrals…)
component.setAttribute('template-extras', JSON.stringify(templateExtras));
component.handleExtras = (extras) => {
  // Items for the clicked category, exactly as your template-extras schema produced them
  console.log('Extras:', extras);
};

// 5. (SDK 1.0.11+) Activity stream — PHI-free events (recording, activity, report, lifecycle).
//    Nothing is delivered without an explicit subscription.
component.setAttribute('event-subscriptions', JSON.stringify(['*']));
component.onEvent = (event) => {
  if (event.name === 'recording.heartbeat') keepSessionAlive(); // every ~30s while audio flows
};

// 6. Mount the component
document.getElementById('container').appendChild(component);
```

## How it works

1. **Import and register the SofIA SDK** (in `main.ts`):

```typescript
import { SofiaSDK } from '@omniloy/sofia-sdk';

// The package ships `sideEffects: false`, so a bare `import '@omniloy/sofia-sdk'`
// gets tree-shaken out of production builds and <sofia-sdk> never registers.
// Register the element explicitly:
if (!customElements.get('sofia-sdk')) {
  customElements.define('sofia-sdk', SofiaSDK);
}
```

2. **Create and configure the component** (in `SofIA.ts`):

```typescript
const component = document.createElement('sofia-sdk');
component.setAttribute('apikey', config.apiKey);
component.setAttribute('userid', config.userId);
component.setAttribute('patientid', config.patientId);
component.setAttribute('templateid', config.templateId);
component.setAttribute('template', JSON.stringify(template));
component.setAttribute('patientdata', JSON.stringify(patientData));
component.setAttribute('isopen', 'true');
component.setAttribute('language', config.language || 'es');
// baseurl is optional — set it only if Omniloy tells you your key needs it:
if (config.baseUrl) component.setAttribute('baseurl', config.baseUrl);
```

3. **Set up required callbacks**:

```typescript
component.handleReport = (report) => {
  // Called when a report is generated
};

component.setIsOpen = (valueOrFn) => {
  // Controls widget visibility — receives a boolean or a toggle function
};

component.setGetLastReport = (fn) => {
  // Receives an async function to retrieve the last report
};

container.appendChild(component);
```

## SDK Attributes

### Required

| Attribute    | Description                                                          |
|--------------|----------------------------------------------------------------------|
| `apikey`     | Authentication key (provided by Omniloy) |
| `userid`     | Application user identifier                                         |
| `patientid`  | Patient context                                                      |
| `template`   | JSON Schema template for report generation                           |
| `templateid` | Template identifier (both `template` and `templateid` needed for reports) |

### Optional

| Attribute              | Description                                                                                |
|------------------------|--------------------------------------------------------------------------------------------|
| `baseurl`              | SofIA API endpoint. Optional (1.0.8+) for some keys; Omniloy tells you if yours needs it |
| `isopen`               | Show/hide component (`"true"` / `"false"`)                                                 |
| `language`             | Interface language code (e.g., `"es"`, `"en_US"`, `"en_GB"`, `"pt_BR"`); unsupported values are ignored |
| `debug`                | Enable debug logging (`"true"`)                                                            |
| `patientdata`          | JSON string with patient information                                                       |
| `usermedicalspecialty` | (1.0.9+) Doctor's medical specialty, attached to tracked events for analytics segmentation |
| `template-extras`      | (1.0.9+) JSON Schema whose top-level properties define per-category extras action buttons (requires `handleExtras`) |
| `event-subscriptions`  | (1.0.11+) JSON array of the events `onEvent` receives: exact names (`"recording.started"`), family wildcards (`"recording.*"`) or `"*"`. Without it no events are delivered |
| `hisversion`           | (1.0.13+) Version of your HIS/EMR, sent as the `x-his-version` header. Printable ASCII, max 64 characters |

> `wssurl` is **deprecated and ignored** since 1.0.7 — the transcription WebSocket URL is provided by the API. Do not set it.

## Callbacks

Required:

| Callback            | Signature                                                  | Description                          |
|---------------------|------------------------------------------------------------|--------------------------------------|
| `handleReport`      | `(report: unknown) => void`                                | Receives generated reports           |
| `setIsOpen`         | `(value: boolean \| (prev: boolean) => boolean) => void`   | Controls widget visibility           |
| `setGetLastReport`  | `(fn: () => Promise<unknown>) => void`                     | Exposes async function for last report |

New in SDK 1.0.8 (assigned as JS properties, same as above):

| Property            | Signature                                                  | Description                          |
|---------------------|------------------------------------------------------------|--------------------------------------|
| `onReportApply`     | `(curated: unknown) => void`                               | Receives the curated report from the [insertion preview modal](https://omniloy.mintlify.app/en). Falls back to `handleReport` when the modal is disabled |
| `updateTemplate`    | `() => Record<string, unknown> \| null \| undefined \| Promise<…>` | Returns existing EMR content keyed by template property id so regeneration integrates it. See [Pre-fill from your EMR](https://omniloy.mintlify.app/en) |
| `insertionPreviewClassNames` | `Record<string, string>`                          | Optional class-name overrides for the insertion preview modal (shadow DOM) |

New in SDK 1.0.9:

| Property            | Signature                                                  | Description                          |
|---------------------|------------------------------------------------------------|--------------------------------------|
| `handleExtras`      | `(extras: Array<Record<string, unknown>>) => void`         | Receives the extracted items when the user clicks an extras category button. Items arrive exactly as the `template-extras` schema produced them — no field remapping |

New in SDK 1.0.11:

| Property            | Signature                                                  | Description                          |
|---------------------|------------------------------------------------------------|--------------------------------------|
| `onEvent`           | `(event: SdkEvent) => void`                                | Activity stream filtered by `event-subscriptions`. Event families: `recording` (`started`, `stopped`, `audio_lost`, `microphone_disconnected`, `heartbeat`), `activity` (`interaction`, `typing`), `report` (`generation_started`, `settled`) and `lifecycle` (`ready`, `closed`). Each event carries `{ name, family, level, ts, seq, sdkVersion, sessionId, payload }`; payloads hold only enums, booleans and numbers — never clinical text or identifiers. |

## Consent, Minors and the Note Confirmation Pop-up

Three behaviours are enabled per API key by Omniloy and driven by `patientdata` — no extra props:

- **Consent indicator** — `patientdata.signedConsent` (`{ signed, date, aiUse? }`) shows a *Signed / Unsigned consent* badge in the SDK header; `aiUse: 'refused'` blocks recording and report generation.
- **Under-age patients** — the SDK computes the age from `patientdata.birthDate` (prefer ISO `YYYY-MM-DD`) and, depending on the policy configured for your key, shows a **warning**, asks the doctor to **confirm**, or **blocks** recording and report generation.
- **Note confirmation pop-up (insertion preview)** — the doctor reviews and curates the generated note before it reaches your app; the result arrives via `onReportApply` instead of `handleReport`.

Full details in the [root README](../../README.md#compliance-features-driven-by-patient-data). The sample patient data in this example includes `signedConsent` so you can see the indicator once it is enabled for your key.

## Development Features

- **Runtime Controls**: Open/Close SDK, get reports
- **State Monitor**: Real-time component status, reports received and SDK event count
- **SDK Events**: Live log of the activity events delivered to `onEvent`
- **Template Editor**: Live JSON editing with validation
- **Template ID Input**: Set the template identifier
- **Debug Toggle**: Enable/disable SDK debug mode
- **Patient Data Editor**: Edit patient context in real-time

## Key Files

- `src/main.ts` - Entry point, registers the `<sofia-sdk>` element
- `src/components/SofIA.ts` - Complete integration with lifecycle, events & UI controls
- `src/utils/config.ts` - Default configuration and template
- `public/assets/environment.json` - Environment configuration (gitignored)

## Tech Stack

- **Vite** 7
- **TypeScript** 5.8
- **SofIA SDK**: @omniloy/sofia-sdk
- No framework dependencies (pure vanilla TypeScript)

## Troubleshooting

- **Component not loading**: Ensure SofIA SDK is installed: `npm install @omniloy/sofia-sdk`
- **Callbacks not firing**: Assign them as JS properties on the element (`component.handleReport = …`), not as attributes or DOM event listeners
- **`onEvent` never fires**: Set the `event-subscriptions` attribute (e.g. `["*"]`) — without it no events are delivered
- **Boolean attributes**: Must be strings (`"true"` / `"false"`) when using `setAttribute`
- **No generate button**: Both `template` AND `templateid` must be set for report generation

## Resources

- [SofIA SDK Documentation](https://omniloy.mintlify.app/en)
- [Report Issues](https://github.com/omniloy/sofia-sdk-examples/issues)

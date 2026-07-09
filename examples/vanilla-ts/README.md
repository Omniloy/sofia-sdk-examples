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
import '@omniloy/sofia-sdk';

// Wait for the custom element to be registered
await customElements.whenDefined('sofia-sdk');

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

// 4. Mount the component
document.getElementById('container').appendChild(component);
```

## How it works

1. **Import SofIA SDK** (in `main.ts`):

```typescript
import '@omniloy/sofia-sdk';
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
| `language`             | Interface language (e.g., `"es"`, `"en"`)                                                  |
| `debug`                | Enable debug logging (`"true"`)                                                            |
| `patientdata`          | JSON string with patient information                                                       |

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

## Development Features

- **Runtime Controls**: Open/Close SDK, get reports, refresh component
- **State Monitor**: Real-time component status and event tracking
- **Template Editor**: Live JSON editing with validation
- **Template ID Input**: Set the template identifier
- **Debug Toggle**: Enable/disable SDK debug mode
- **Patient Data Editor**: Edit patient context in real-time

## Key Files

- `src/main.ts` - Entry point, imports SofIA SDK
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
- **Callbacks not firing**: Assign `handleReport`, `setIsOpen`, `setGetLastReport` after creating the component
- **Boolean attributes**: Must be strings (`"true"` / `"false"`) when using `setAttribute`
- **No generate button**: Both `template` AND `templateid` must be set for report generation

## Resources

- [SofIA SDK Documentation](https://omniloy.mintlify.app/en)
- [Report Issues](https://github.com/omniloy/sofia-sdk-examples/issues)

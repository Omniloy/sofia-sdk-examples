# SofIA SDK - Angular

Angular 19+ integration example for the SofIA SDK, featuring a live development environment with dynamic configuration, real-time debugging tools, and complete SDK integration patterns.

## Prerequisites

- **Node.js** >= 22.12 (recommended for Angular 19 + esbuild)
- **npm** >= 8.x
- **Angular CLI** (installed automatically via devDependencies)

## Quick Start

### 1. Configure Environment

Copy the example environment file and update it with your SofIA SDK credentials:

```bash
cp environment.example.ts environment.ts
```

Then edit `environment.ts`:

```typescript
export const environment = {
  production: false,
  sdk: {
    apiKey: 'YOUR_API_KEY',
    // Optional — Omniloy tells you if your key needs it, e.g. https://api.example.com/v1
    baseUrl: '',
    userId: 'YOUR_DEFAULT_USER_ID',
    patientId: 'YOUR_DEFAULT_PATIENT_ID',
    templateId: 'YOUR_TEMPLATE_ID',
    language: 'es',
    debug: true
  }
};
```

Replace the placeholder values with actual credentials provided by Omniloy. `wssurl` is no longer used (deprecated and ignored since SDK 1.0.7 — the transcription URL is delivered by the settings API).

### 2. Install & Run

```bash
npm install
npm start
```

Navigate to: `http://localhost:4200`

## Architecture

### SDK Integration

This example uses the SofIA SDK from npm:

```json
{
  "dependencies": {
    "@omniloy/sofia-sdk": "^1.0.9"
  }
}
```

The SofIA SDK provides a web component (`<sofia-sdk>`) that integrates into Angular via `CUSTOM_ELEMENTS_SCHEMA`.

### Component Structure

```
src/app/
├── app.component.ts             # Root component, imports SDK
├── app.component.html           # Router outlet
├── sofia.component.ts           # Main integration component
├── sofia.component.css          # Styling
└── template/
    └── Template.ts              # Template schema definition
```

## SDK Attributes

The `<sofia-sdk>` element accepts these attributes:

| Attribute               | Description                                                     |
|------------------------|------------------------------------------------------------------|
| `apikey`               | API key (provided by Omniloy) |
| `baseurl`              | API base URL — **optional** for some keys; Omniloy tells you if yours needs it |
| `userid`               | User identifier                                                  |
| `patientid`            | Patient identifier                                               |
| `templateid`           | Template identifier                                              |
| `template`             | JSON template schema                                             |
| `patientdata`          | JSON patient context data                                        |
| `language`             | Language code (e.g. `es`)                                        |
| `isopen`               | Whether the SDK panel is open                                    |
| `debug`                | Enable debug mode                                                |

### Example Binding

```html
<sofia-sdk
  id="sofia"
  [attr.baseurl]="environment.sdk.baseUrl || null"
  [attr.language]="environment.sdk.language || 'es'"
  [attr.apikey]="environment.sdk.apiKey"
  [attr.userid]="environment.sdk.userId"
  [attr.patientid]="environment.sdk.patientId"
  [attr.templateid]="environment.sdk.templateId"
  [attr.template]="templateStringValue"
  [attr.patientdata]="patientDataString"
  [attr.isopen]="isOpen ? 'true' : 'false'"
  [attr.debug]="debug ? 'true' : null">
</sofia-sdk>
```

## Minimal Integration

Copy-paste this to integrate the Sofia SDK into any Angular project. See the code between `SDK INTEGRATION START` and `SDK INTEGRATION END` in `src/app/sofia.component.ts` for the full working version.

**1. Template** — add `CUSTOM_ELEMENTS_SCHEMA` and bind attributes:

```html
<!-- In your component template -->
<sofia-sdk
  id="sofia"
  [attr.baseurl]="environment.sdk.baseUrl || null"
  [attr.apikey]="environment.sdk.apiKey"
  [attr.userid]="environment.sdk.userId"
  [attr.patientid]="environment.sdk.patientId"
  [attr.templateid]="environment.sdk.templateId"
  [attr.template]="templateStringValue"
  [attr.isopen]="isOpen ? 'true' : 'false'"
  [attr.language]="environment.sdk.language || 'es'"
></sofia-sdk>
```

**2. Component** — set the three required callbacks:

```typescript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SofiaSDK } from '@omniloy/sofia-sdk';

// The package ships `sideEffects: false`, so a bare `import '@omniloy/sofia-sdk'`
// gets tree-shaken out of production builds and <sofia-sdk> never registers.
// Register the element explicitly (do this once, e.g. in main.ts):
if (!customElements.get('sofia-sdk')) {
  customElements.define('sofia-sdk', SofiaSDK);
}

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ...
})
export class MyComponent implements OnInit {
  ngOnInit() {
    const component = document.getElementById('sofia') as any;
    if (!component) return;

    component.handleReport = (report: any) => {
      console.log('Report received:', report);
    };

    component.setIsOpen = (valueOrFn: any) => {
      this.isOpen = typeof valueOrFn === 'function' ? valueOrFn(this.isOpen) : valueOrFn;
    };

    component.setGetLastReport = (fn: () => Promise<unknown>) => {
      this.getLastReportFn = fn;
    };
  }
}
```

## Required Callbacks

Three callbacks must be set on the `<sofia-sdk>` element as properties:

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
```

Callbacks are assigned as **element properties** (shown above), not DOM event bindings — the SDK does not emit `handle-report`/`set-is-open` events, so Angular bindings like `(handle-report)` would never fire.

### New in v1.0.8

Three optional properties power the newest features (also assigned as element properties):

```typescript
// Curated report from the insertion preview modal (opt-in per API key on the backend).
// Falls back to handleReport when the modal is disabled.
component.onReportApply = (curated) => {
  // curated: only the fields the doctor kept/edited
};

// Feed the doctor's existing EMR field content into generation so regeneration
// integrates it (keys must match the template property ids).
component.updateTemplate = () => ({
  reason_for_consultation: form.reason,
  treatment_plan: form.plan,
});

// Optional: class-name overrides to style the insertion preview modal.
component.insertionPreviewClassNames = { panel: 'sofia-preview-panel' };
```

See the [insertion preview](https://omniloy.mintlify.app/en/sofia/en/sdk/insertion-preview) and [updateTemplate](https://omniloy.mintlify.app/en/sofia/en/sdk/update-template) guides for the full flow.

### New in v1.0.9

**Extras — per-category action buttons.** Provide a JSON Schema via the `template-extras` attribute; each top-level property (appointments, tests, referrals, …) renders one button in the SDK chat footer. Clicking a button extracts only that category from the transcript and delivers the items to `handleExtras` exactly as the schema produced them (no field remapping):

```html
<sofia-sdk [attr.template-extras]="templateExtrasString" ...></sofia-sdk>
```

```typescript
component.handleExtras = (extras) => {
  // e.g. [{ type: 'laboratory', description: 'Complete blood panel' }]
};
```

**`usermedicalspecialty`** (optional attribute) — the doctor's specialty, attached to tracked events for analytics segmentation. Note the all-lowercase name: the camelCase `userMedicalSpecialty` spelling that shipped in v1.0.8 was renamed and is silently ignored since v1.0.9.

## Development Features

- **Runtime Controls** - Open/Close SDK, fetch reports, reload component
- **State Monitor** - Real-time SDK status and event tracking
- **Template Editor** - JSON editor with validation for the template schema
- **Patient Data Editor** - Live patient data editing with validation
- **Debug Toggle** - Enable/disable debug mode on the SDK component
- **Template ID Input** - Dynamically change the template ID
- **Curated Report Display** - Shows the payload from `onReportApply` (insertion preview modal, v1.0.8)
- **Extras Display** - Shows the items delivered to `handleExtras` (per-category extras, v1.0.9)

## Documentation

Full SDK documentation is available at [https://omniloy.mintlify.app/en](https://omniloy.mintlify.app/en).

## Related Examples

- [Vanilla TypeScript Example](../vanilla-ts/) - Basic SDK integration without a framework
- [AngularJS Example](../angularjs/) - Legacy AngularJS implementation

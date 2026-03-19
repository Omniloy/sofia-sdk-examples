# SofIA SDK - React

This project demonstrates how to integrate the **SofIA SDK** into a **React 19** application using the `<Omniscribe>` React component, **TypeScript**, and **Vite**.

## What this example shows

- SofIA SDK integration using the `<Omniscribe>` React component
- Dynamic configuration with real-time debugging tools
- Complete development environment with SDK controls
- Event handling and state management with React hooks
- Running with Vite + React 19 + TypeScript 5.8

## Setup

### Prerequisites

- Node.js >= 22.12 (required by Vite 7)
- npm >= 8.x

### Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
VITE_BASE_URL='https://api.example.com/v1'
VITE_WSS_URL='wss://ws.example.com'
VITE_API_KEY='sk-xxxxxxxxxxxx'
VITE_DEBUG=true
```

> **Important**: Replace placeholder values with actual credentials provided by Omniloy.

### Installation & Run

```bash
npm install
npm run dev
```

Then open: http://localhost:5174

## Minimal Integration

Import `Omniscribe` from `@omniloy/sofia-sdk/react` and pass props directly — no refs, no imperative DOM:

```tsx
import { useState } from 'react';
import { Omniscribe, LanguageCode } from '@omniloy/sofia-sdk/react';
import '@omniloy/sofia-sdk/react/index.css';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Omniscribe
      baseurl="https://api.example.com/v1"
      wssurl="wss://ws.example.com"
      apikey="sk-xxxxxxxxxxxx"
      userid="user-123"
      patientid="patient-456"
      templateid="tpl-789"
      template={myTemplate}
      patientdata={myPatientData}
      isopen={isOpen}
      setIsOpen={setIsOpen}
      handleReport={(report) => console.log('Report:', report)}
      setGetLastReport={(fn) => { /* store fn for later */ }}
      language={LanguageCode.es}
    />
  );
}
```

## How it works

1. **Import the React component and styles**:

```typescript
import { Omniscribe, LanguageCode } from '@omniloy/sofia-sdk/react';
import '@omniloy/sofia-sdk/react/index.css';
```

2. **Render `<Omniscribe>` with props**:

```tsx
<Omniscribe
  baseurl={config.baseUrl}
  wssurl={config.wssUrl}
  apikey={config.apiKey}
  userid={userId}
  patientid={patientId}
  templateid={templateId}
  template={template}
  patientdata={patientData}
  isopen={isOpen}
  setIsOpen={setIsOpen}
  handleReport={handleReport}
  setGetLastReport={handleSetGetLastReport}
  language={LanguageCode.es}
  debug={debug}
/>
```

3. **Handle callbacks with React state**:

```typescript
const handleReport = useCallback((report: unknown) => {
  console.log('Report received:', report);
}, []);

const handleSetGetLastReport = useCallback((fn: () => Promise<unknown>) => {
  // Store fn — call `await fn()` to retrieve the last report
}, []);
```

## Props

### Required

| Prop         | Type     | Description                                                          |
|--------------|----------|----------------------------------------------------------------------|
| `baseurl`    | string   | SofIA API endpoint                                                   |
| `wssurl`     | string   | WebSocket URL for real-time features                                 |
| `apikey`     | string   | Authentication key                                                   |
| `userid`     | string   | Application user identifier                                         |
| `patientid`  | string   | Patient context                                                      |
| `template`   | object   | Template object for report generation                                |
| `templateid` | string   | Template identifier (both `template` and `templateid` needed for reports) |

### Optional

| Prop          | Type         | Description                                  |
|----------------------------|--------------|-------------------------------------------------------------------|
| `isopen`                   | boolean      | Show/hide component                                               |
| `language`                 | LanguageCode | Interface language (e.g., `LanguageCode.es`)                      |
| `debug`                    | boolean      | Enable debug logging                                              |
| `patientdata`              | object       | Patient information (see below)                                   |
| `showconsentindicator`     | boolean      | Show the consent status indicator in the header (default: false)  |


### Callbacks

| Prop                | Signature                                                  | Description                          |
|---------------------|------------------------------------------------------------|--------------------------------------|
| `handleReport`      | `(report: unknown) => void`                                | Receives generated reports           |
| `setIsOpen`         | `(value: boolean \| (prev: boolean) => boolean) => void`   | Controls widget visibility           |
| `setGetLastReport`  | `(fn: () => Promise<unknown>) => void`                     | Exposes async function for last report |

## Patient Data Structure

The `patientdata` prop accepts the following structure:

```typescript
type TPatientData = {
  fullName: string | undefined;
  birthDate: string | undefined;
  phone: string | undefined;
  address: string | undefined;
  extraData: Record<string, unknown> | undefined;
  signedConsent?: { signed: boolean; date: string };
};
```

### `extraData` fields

| Field                   | Description                                                                                                        |
|-------------------------|--------------------------------------------------------------------------------------------------------------------|
| `medical_practice`      | The doctor's specialty (e.g., `"Cardiology"`, `"Pediatrics"`). Helps SofIA tailor responses to the clinical context |
| `patient_medical_notes` | Previous consultation notes. Include `url` fields if you want SofIA to cite the source                             |
| *(custom fields)*       | Any additional patient data relevant to the consultation (e.g., `allergies`, `medications`)                        |

### Example

```typescript
const patientData = {
  fullName: 'John Doe',
  birthDate: '01/15/1980',
  phone: '+1 555-123-4567',
  address: '123 Main St, Example City, USA',
  extraData: {
    medical_practice: 'Cardiology',
    patient_medical_notes: [
      {
        date: '2024-11-20',
        note: 'Patient presents with chest pain. ECG normal. Prescribed aspirin.',
        url: 'https://ehr.example.com/notes/12345',
      },
      {
        date: '2025-01-10',
        note: 'Follow-up visit. Chest pain resolved. Blood pressure 130/85.',
      },
    ],
    allergies: 'pollen, penicillin',
    medications: 'metformin, insulin, aspirin',
  },
  signedConsent: {
    signed: true,
    date: '2025-03-01',
  },
};
```

## Development Features

- **Runtime Controls**: Open/Close SDK, get reports
- **State Monitor**: Real-time SDK state and event tracking
- **Template Editor**: Live JSON editing with validation
- **Template ID Input**: Set the template identifier
- **User ID / Patient ID Inputs**: Change session identifiers at runtime
- **Debug Toggle**: Enable/disable SDK debug mode
- **Patient Data Editor**: Edit patient context in real-time

## Key Files

- `src/main.tsx` - Entry point
- `src/App.tsx` - Complete integration with `<Omniscribe>` component & dev console
- `src/utils/config.ts` - Default patient data and template configuration
- `.env` - Environment configuration (gitignored)

## Tech Stack

- **Vite** 7
- **React** 19
- **TypeScript** 5.8
- **SofIA SDK**: `@omniloy/sofia-sdk/react`

## Troubleshooting

- **Component not loading**: Ensure SofIA SDK is installed: `npm install @omniloy/sofia-sdk`
- **Missing CSS**: Import `@omniloy/sofia-sdk/react/index.css` in your entry point
- **No generate button**: Both `template` AND `templateid` must be set for report generation
- **Session not updating**: Changing `userid` or `patientid` props triggers an automatic SDK remount

## Resources

- [SofIA SDK Documentation](https://omniloy.mintlify.app/en)
- [Report Issues](https://github.com/omniloy/sofia-sdk-examples/issues)

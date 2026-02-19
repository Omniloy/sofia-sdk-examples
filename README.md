# Sofia SDK Examples

![Examples](https://img.shields.io/badge/Examples-3-orange)
![License](https://img.shields.io/badge/License-MIT-green)
![SDK Version](https://img.shields.io/badge/SDK-v1.0.0-blue)

Quick examples showing how to integrate **Sofia SDK** (`@omniloy/sofia-sdk`) into different web frameworks. Pick your framework and get started in minutes!

## Available Examples

| Framework | Description | Directory |
|-----------|-------------|-----------|
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
   cd examples/vanilla-ts    # or examples/angular, examples/angularjs
   ```

3. **Configure credentials** (see [Getting Credentials](#getting-credentials) below):
   ```bash
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
   | `baseUrl` | Sofia API endpoint | `https://api.example.com/v1` |
   | `wssUrl` | WebSocket URL for real-time features | `wss://ws.example.com` |
   | `apiKey` | Authentication key | `sk-xxxxxxxxxxxx` |
   | `userId` | Your user identifier | `user-123` |
   | `patientId` | Patient context for testing | `patient-456` |
   | `templateId` | Template identifier | `tpl-789` |

> **Note**: If credentials are left as placeholder values (`YOUR_API_KEY`, etc.), the examples will show a configuration error at startup.

### Environment Files

Each example has an `.example` file you copy and fill in:

| Example | Copy from | To (gitignored) |
|---|---|---|
| Vanilla TS | `public/assets/environment.example.json` | `public/assets/environment.json` |
| Angular | `environment.example.ts` | `environment.ts` |
| AngularJS | `src/assets/environment.example.json` | `src/assets/environment.json` |

### Required Parameters

```typescript
{
  // Credentials from Omniloy
  baseUrl: 'https://api.example.com/v1', // Sofia API endpoint
  wssUrl: 'wss://ws.example.com',        // WebSocket URL
  apiKey: 'sk-xxxxxxxxxxxx',             // Authentication key

  // Your application data
  userId: 'user-123',                    // User identifier
  patientId: 'patient-456',             // Patient context

  // Template configuration (both required for report generation)
  template: {},                          // JSON Schema template
  templateId: 'tpl-789',                // Template identifier

  // Optional configuration
  isOpen: true,                          // Show/hide component
  language: 'en',                        // Interface language
  debug: true,                           // Enable debug logging
}
```

### Available Callbacks

Three callbacks must be set on the `<sofia-sdk>` element:

```javascript
// Handle generated reports
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
```

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
| Callbacks not firing | Assigned before element exists | Assign `handleReport`, `setIsOpen`, `setGetLastReport` after the element is in the DOM |
| Boolean attributes ignored | Using boolean instead of string | Use strings: `setAttribute('isopen', 'true')`, not booleans |
| WebSocket errors | Invalid `wssUrl` | Verify `wssUrl` starts with `wss://` and matches the value provided by Omniloy |

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

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
  "baseUrl": "YOUR_BASE_URL",
  "wssUrl": "YOUR_WSS_URL",
  "apiKey": "YOUR_API_KEY",
  "userId": "YOUR_DEFAULT_USER_ID",
  "patientId": "YOUR_DEFAULT_PATIENT_ID",
  "templateId": "YOUR_TEMPLATE_ID",
  "language": "es",
  "isOpen": true,
  "debug": true
}
```

### 2. Install and Run

```bash
npm install
npm run dev
```

Navigate to `http://localhost:8000`.

## SDK Loading

The SofIA SDK is loaded via CDN in `src/index.html` (pinned to v1.0.0) before AngularJS so that the `<sofia-sdk>` custom element is registered when Angular compiles the template:

```html
<script src="https://unpkg.com/@omniloy/sofia-sdk@1.0.0/dist/webcomponents.umd.js"
        integrity="sha384-..." crossorigin="anonymous"></script>
```

All CDN scripts include Subresource Integrity (SRI) hashes to prevent supply chain attacks.

## SDK Attributes

The `<sofia-sdk>` element accepts the following attributes:

| Attribute               | Description                                                     |
|------------------------|------------------------------------------------------------------|
| `patientid`            | Patient identifier                                               |
| `userid`               | User / practitioner identifier                                   |
| `templateid`           | Template identifier for clinical notes                           |
| `apikey`               | API key for authentication                                       |
| `baseurl`              | Base URL of the SofIA API                                        |
| `wssurl`               | WebSocket URL for real-time communication                        |
| `isopen`               | Whether the widget starts open                                   |
| `language`             | Interface language (e.g., `es`)                                  |
| `template`             | JSON string with the template schema                             |
| `patientdata`          | JSON string with patient context                                 |
| `debug`                | Enable debug mode (console output)                               |
| `showconsentindicator` | Show the consent status indicator in the header (default: false) |

## Minimal Integration

Copy-paste this to integrate the Sofia SDK into any AngularJS project. See the code between `SDK INTEGRATION START` and `SDK INTEGRATION END` in `src/app/controllers/MainController.js` for the full working version.

**1. Load the SDK** via CDN in your HTML (before AngularJS):

```html
<script src="https://unpkg.com/@omniloy/sofia-sdk@1.0.0/dist/webcomponents.umd.js"></script>
```

**2. Add the component** in your template:

```html
<sofia-sdk id="sofia-component"
  patientid="{{patientId}}"
  userid="{{userId}}"
  templateid="{{templateId}}"
  apikey="{{apiKey}}"
  baseurl="{{baseUrl}}"
  wssurl="{{wssUrl}}"
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
  // Called when a report is generated
};

component.setIsOpen = function(valueOrFn) {
  // Controls widget visibility — receives a boolean or a toggle function
};

component.setGetLastReport = function(fn) {
  // Receives an async function to retrieve the last report
};
```

The component also emits DOM events: `handle-report`, `set-is-open`, `set-get-last-report`.

## Features

- **Template editor** -- edit the template schema JSON live with validation.
- **Template ID** -- change the active template ID at runtime.
- **Patient data editor** -- modify patient context on the fly.
- **Debug toggle** -- enable verbose console output from the SDK.
- **Runtime controls** -- open/close the widget, fetch reports, and reload the component.
- **State monitor** -- view component mount status, SDK state, and event counts.

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
    template.js                   # Default template schema
    logo.svg                      # Omniloy logo
  index.html                      # Entry point with CDN script
  index.css                       # Styles
```

## Related Examples

- [Vanilla TypeScript](../vanilla-ts/) -- framework-free implementation
- [Angular](../angular/) -- modern Angular implementation

---

Need help? Check the [documentation](https://omniloy.mintlify.app/en) or contact Omniloy support.

# Sofia SDK - Angular TypeScript Integration Example

A comprehensive Angular TypeScript integration example showcasing the Sofia SDK with live development tools, dynamic configuration editing, and complete SDK lifecycle management.

## 🚀 What this example demonstrates

- **Complete Sofia SDK integration** in Angular 19+ with TypeScript
- **Live development environment** with real-time debugging tools
- **Dynamic configuration editing** for toolArgs and patientData
- **Real-time SDK state monitoring** and event handling
- **Professional UI patterns** for SDK integration
- **Production-ready setup** with npm package management

## 🛠️ Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 8.x
- **Angular CLI** (installed automatically)

## 📦 Quick Start

### 1. Configure Environment

Update `src/environment.ts` with your Sofia SDK credentials:

```typescript
export const environment = {
  production: false,
  omniscribe: {
    baseUrl: 'YOUR_BASE_URL',
    wssUrl: 'YOUR_WSS_URL',
    apiKey: 'YOUR_API_KEY',
    defaultUserId: 'YOUR_DEFAULT_USER_ID',
    defaultPatientId: 'YOUR_DEFAULT_PATIENT_ID',
    chatsources: [
      'Guías Clínicas',
      'Base de Datos de Medicamentos',
      'Estudios Científicos',
      'Base de Datos EMA',
      'Guías OMS',
      'Guías SEOM'
    ],
    features: {
      debugMode: true,
      enableJsonPreview: true
    }
  }
};
```

> **⚠️ Important**: Replace the placeholder values (`YOUR_BASE_URL`, `YOUR_WSS_URL`, etc.) with actual credentials provided by Omniloy.

### 2. Install & Run

```bash
npm install
npm start
```

Navigate to: `http://localhost:4200`

## 🏗️ Architecture Overview

### SDK Integration

This example uses the Sofia SDK from npm:

```json
{
  "dependencies": {
    "@omniloy/sofia-sdk": "0.0.2"
  }
}
```

The Sofia SDK provides a web component (`sofia-sdk`) that can be integrated into any framework, including Angular.

### Component Structure

```
src/app/
├── sofia.component.ts          # Main integration component
├── sofia.component.css         # Styling
├── toolArgs/
│   └── ToolArgs.ts             # Tool schema definitions
└── environment.ts              # SDK configuration
```

## 🎯 Key Features

### 1. SDK Development Console

The example includes a comprehensive development console with:

- **Runtime Controls**: Open/Close SDK, get reports, clear data
- **State Monitor**: Real-time SDK status and event tracking
- **Configuration Display**: Live view of all SDK settings

### 2. Dynamic Configuration Editing

#### Tool Schema Editor (toolArgs)
- Real-time JSON editing with validation
- Schema preview and property counting
- Instant SDK attribute updates

#### Patient Context Editor (patientData)
- Live patient data editing
- JSON validation and error handling
- Dynamic attribute synchronization

#### Component Title Editor
- Editable Sofia component title
- Input validation and length checking
- Real-time component updates

### 3. Professional Integration Patterns

- **Event Handling**: Complete SDK event lifecycle management
- **State Management**: Angular reactive patterns with ChangeDetectorRef
- **Error Handling**: Comprehensive error catching and user feedback
- **Memory Management**: Proper cleanup and observer disconnection

## 🔧 Technical Implementation

### Sofia SDK Import

First, import the Sofia SDK to register the custom element:

```typescript
// Import the Sofia SDK to register the web component
import '@omniloy/sofia-sdk';
```

This import registers the `<sofia-sdk>` custom element globally and should be done in your `main.ts` or component file.

### Custom Elements Integration

```typescript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ...
})
export class OmniscribeDemoComponent {
  // Component implementation
}
```

### SDK Attribute Binding

```html
<sofia-sdk
  id="sofia"
  [baseurl]="environment.omniscribe.baseUrl"
  [apikey]="environment.omniscribe.apiKey"
  [attr.title]="sofiaTitle"
  [attr.toolsargs]="toolsArgsString"
  [attr.patientdata]="patientDataString"
  [attr.isopen]="isOpen ? 'true' : 'false'"
  language="es"
  onlychat="false">
</sofia-sdk>
```

### Event Lifecycle Management

```typescript
// Global function setup for SDK callbacks
private setupGlobalFunctions() {
  window.omniscribeHandleReport = (report: any) => {
    this.zone.run(() => {
      this.lastReportData = report;
      this.reports.push(report);
      this.cdr.detectChanges();
    });
  };
  
  window.omniscribeSetIsOpen = (valueOrFn: any) => {
    this.zone.run(() => {
      this.updateIsOpenState(valueOrFn);
      this.cdr.detectChanges();
    });
  };
}
```

### Dynamic Attribute Updates

```typescript
private updateComponentToolArgs() {
  const component = document.getElementById('sofia');
  if (component) {
    component.setAttribute('toolsargs', JSON.stringify(this.toolsArgs));
    console.log('Sofia component toolsargs attribute updated');
  }
}
```

## � File Structure Deep Dive

### `sofia.component.ts`
The main component handling:
- SDK initialization and lifecycle
- Event handling and state management
- Dynamic configuration editing
- Development tools and debugging

### `sofia.component.css`
Professional styling featuring:
- Clean, developer-focused design
- Responsive layout patterns
- Component-specific styling
- Accessibility considerations

### `toolArgs/ToolArgs.ts`
Tool schema configuration:
- JSON Schema definitions
- Tool property specifications
- Default configuration values

## 🔍 Development Features

### Real-time Debugging
- Live SDK state monitoring
- Event counter and report tracking
- Configuration preview
- Error handling with user feedback

### Dynamic Editing
- JSON editors with syntax validation
- Real-time attribute synchronization
- Undo/cancel functionality
- Professional error messaging

### State Management
- Reactive Angular patterns
- Memory leak prevention
- Proper component cleanup
- Observer pattern implementation

## 🚨 Common Issues & Solutions

### SDK Not Loading
```bash
# Ensure Sofia SDK is installed
npm install @omniloy/sofia-sdk

# Verify import is correct
import '@omniloy/sofia-sdk';
```

### Custom Element Errors
```typescript
// Ensure CUSTOM_ELEMENTS_SCHEMA is included
schemas: [CUSTOM_ELEMENTS_SCHEMA]
```

### Event Handler Issues
```typescript
// Verify global functions are set up correctly
private setupGlobalFunctions() {
  // Implementation required
}
```

### State Synchronization
```typescript
// Use NgZone for proper change detection
this.zone.run(() => {
  // State changes here
  this.cdr.detectChanges();
});
```

## Related Examples

- [Vanilla TypeScript Example](../vanilla-ts/) - Basic SDK integration
- [Angular JS Example](../angular-js/) - Legacy Angular implementation

## 📝 License

This example is part of the Sofia SDK examples repository and follows the same licensing terms.

---

**Need help?** Check the other examples in this repository or contact Omniloy support.
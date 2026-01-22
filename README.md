# Sofia SDK Examples

![Examples](https://img.shields.io/badge/Examples-3-orange)
![License](https://img.shields.io/badge/License-MIT-green)

Quick examples showing how to integrate **Sofia SDK** into different web frameworks. Pick your framework and get started in minutes!

## 🚀 Available Examples

| Framework | Description | Directory |
|-----------|-------------|-----------|
| **Vanilla TypeScript** | Plain TypeScript with Vite | [`/examples/vanilla-ts`](./examples/vanilla-ts/) |
| **Angular** | Angular 19+ integration | [`/examples/angular-ts`](./examples/angular-ts/) |
| **AngularJS** | Legacy AngularJS support | [`/examples/angular-js`](./examples/angular-js/) |

## ⚡ Quick Start

1. **Clone and navigate:**
   ```bash
   git clone https://github.com/omniloy/sofia-sdk-examples.git
   cd sofia-sdk-examples
   ```

2. **Choose your example:**
   ```bash
   cd examples/vanilla-ts    # or examples/angular-ts, examples/angular-js
   ```

3. **Run:**
   ```bash
   npm install
   npm start
   ```

> ⚠️ **Important**: Update environment configuration with your API credentials before running

## 🔧 Configuration

### 🔑 Get Your Credentials

Before running any example, you need API credentials from Omniloy:

1. **Contact Omniloy** to get your credentials:
   - 🌐 Website: [omniloy.com](https://omniloy.com)

2. **You will receive:**
   - `baseUrl` - Your Sofia API endpoint
   - `wssUrl` - WebSocket URL for real-time features  
   - `apiKey` - Your authentication key

### 📝 Required Parameters

```typescript
{
  // Credentials from Omniloy
  baseUrl: 'your-api-base-url',        // Sofia API endpoint 
  wssUrl: 'your-websocket-url',        // WebSocket URL
  apiKey: 'your-api-key',              // Authentication key
  
  // Your application data
  userId: 'your-user-id',              // User identifier
  patientId: 'your-patient-id',        // Patient context
  
  toolsArgs: {}                        // Template configuration
  templateId: 'your-template-id',
  
  // Optional configuration
  sofiatitle: 'Sofia Assistant',            // Component title
  isOpen: true,                        // Show/hide component
  
}
```

### 📋 Available Callbacks

```javascript
// Handle generated reports
component.handleReport = (report) => {
  console.log('Report received:', report);
};

// Handle visibility changes
component.setIsOpen = (isOpen) => {
  console.log('Component visibility:', isOpen);
};
```

### 📂 Environment Files

Update these files with your credentials:
- **Vanilla TypeScript**: `examples/vanilla-ts/public/assets/environment.json`
- **Angular**: `examples/angular-ts/environment.ts` 
- **AngularJS**: `examples/angular-js/assets/example.environment.json`

## 📦 Installation Options

### Option 1: NPM Package (Recommended)
```bash
npm install @omniloy/sofia-sdk
```

### Option 2: CDN
```html
<script src="https://unpkg.com/@omniloy/sofia-sdk@latest/dist/webcomponents.umd.js"></script>
```

## 🔒 License

Examples are MIT licensed. Sofia itself is dual-licensed (AGPLv3/Commercial).

For commercial use, [contact us](mailto:enrique.alcazar@omniloy.com).

## 📚 Resources

- [Sofia SDK Docs](https://omniloy.mintlify.app/en)  
- [Report Issues](https://github.com/omniloy/sofia-sdk-examples/issues)

# Sofia SDK – AngularJS Integration Example

A comprehensive AngularJS (1.x) integration example showcasing the Sofia SDK with development tools, dynamic configuration editing, and complete SDK lifecycle management in a legacy Angular environment.

## 🚀 What this example demonstrates

- **Complete Sofia SDK integration** in AngularJS 1.8.3
- **Development environment** with real-time debugging tools
- **Dynamic configuration editing** with live JSON validation
- **Legacy framework compatibility** with modern web components
- **UI patterns** adapted for AngularJS
- **Production-ready setup** with proper build pipeline

## 🛠️ Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 8.x or **yarn**
- Modern browser with Custom Elements support

## 📦 Quick Start

### 1. Configure Environment

Create or update `.env` file with your Sofia SDK credentials:

```bash
BASEURL=YOUR_BASE_URL
WSSURL=YOUR_WSS_URL
APIKEY=YOUR_API_KEY
DEFAULTUSERID=YOUR_DEFAULT_USER_ID
DEFAULTPATIENTID=YOUR_DEFAULT_PATIENT_ID
```

The build script will generate `src/assets/environment.json` with placeholders as fallback:

```json
{
  "baseUrl": "YOUR_BASE_URL",
  "wssUrl": "YOUR_WSS_URL", 
  "apiKey": "YOUR_API_KEY",
  "defaultUserId": "YOUR_DEFAULT_USER_ID",
  "defaultPatientId": "YOUR_DEFAULT_PATIENT_ID"
}
```

> **⚠️ Important**: Replace the placeholder values with actual credentials provided by Omniloy.

### 2. Install & Run

```bash
npm install
npm run dev
# or
yarn install
yarn dev
```

Navigate to: `http://localhost:8000`

## 🏗️ Architecture Overview

### SDK Integration

This example uses the Sofia SDK from npm:

```json
{
  "dependencies": {
    "@omniloy/sofia-sdk": "0.0.4"
  }
}
```

The Sofia SDK provides a web component (`sofia-sdk`) that can be integrated into any framework, including legacy AngularJS.

### Component Structure

```
src/
├── app/
│   ├── app.js                     # Main AngularJS module and routing
│   ├── controllers/
│   │   └── MainController.js      # Main controller with SDK integration
│   └── views/
│       └── main.html              # Template with professional UI
├── assets/
│   ├── environment.json           # Generated configuration file
│   ├── toolArgs.js                # Tool schema definitions
│   └── logo.svg                   # Omniloy logo
├── css/
│   └── style.css                  # Professional styling
├── index.html                     # Main HTML with SDK script loading
└── index.css                      # Additional styles
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

- **Legacy Compatibility**: AngularJS 1.x patterns with modern web components
- **Event Handling**: Complete SDK event lifecycle management
- **State Management**: AngularJS scope integration with SDK events
- **Error Handling**: Comprehensive error catching and user feedback
- **Build Pipeline**: Automated environment configuration

## 🔧 Technical Implementation

### Sofia SDK Loading

The SDK is loaded via script tag from node_modules:

```html
<!-- Load web components FIRST before Angular -->
<script src="/node_modules/@omniloy/sofia-sdk/dist/webcomponents.umd.js"></script>
```

### AngularJS Integration

```html
<!-- Simple component declaration in template -->
<sofia-sdk id="sofia-component"></sofia-sdk>
```

```javascript
// Controller setup with SDK configuration
angular.module('myApp').controller('MainController', function($scope) {
  // Load environment configuration
  $scope.setupComponent = function() {
    const component = document.getElementById('sofia-component');
    if (component) {
      component.setAttribute('baseurl', environment.baseUrl);
      component.setAttribute('apikey', environment.apiKey);
      // ... other attributes
    }
  };
});
```

## 📂 Key Files

- **src/index.html** → Main HTML with SDK script loading and AngularJS setup
- **src/app/app.js** → AngularJS module configuration and routing
- **src/app/controllers/MainController.js** → Complete SDK integration and UI controls
- **src/app/views/main.html** → Professional template with development console
- **generate-env.js** → Environment configuration build script
- **src/assets/environment.json** → Generated configuration file

## 🔍 Troubleshooting

- **Component not loading** → Ensure Sofia SDK script loads before AngularJS: check script order in index.html
- **Environment issues** → Run `npm run build` to regenerate environment.json from .env
- **SDK not responding** → Verify all placeholder values are replaced with actual credentials
- **UI not updating** → Check `$scope.$apply()` calls in async operations

## 📦 Tech Stack

- **AngularJS** 1.8.3
- **Sofia SDK**: @omniloy/sofia-sdk@0.0.4
- **http-server** for development
- **Node.js** for build pipeline

## 🌐 Browser Compatibility

- **Chrome** 54+
- **Firefox** 63+
- **Safari** 10.1+
- **Edge** 79+

## 🎯 Replicating this Integration

### For New AngularJS Projects

1. **Install Sofia SDK**:
   ```bash
   npm install @omniloy/sofia-sdk@0.0.4
   ```

2. **Load SDK script** (before AngularJS):
   ```html
   <script src="/node_modules/@omniloy/sofia-sdk/dist/webcomponents.umd.js"></script>
   ```

3. **Add component to template**:
   ```html
   <sofia-sdk id="sofia"></sofia-sdk>
   ```

4. **Configure in controller**:
   ```javascript
   $scope.setupSofia = function() {
     const component = document.getElementById('sofia');
     component.setAttribute('baseurl', 'YOUR_BASE_URL');
     component.setAttribute('apikey', 'YOUR_API_KEY');
   };
   ```

### Key Integration Points

- **Load Sofia SDK first** before AngularJS to ensure web component registration
- **Use simple HTML declaration** - AngularJS handles DOM manipulation differently than modern frameworks
- **Configure via JavaScript** after DOM is ready, not in template attributes
- **Handle events manually** using standard DOM event listeners
- **Use `$scope.$apply()`** when updating scope from SDK events

## 🔗 Related Examples

- **[Angular TypeScript](../angular-ts/)** - Modern Angular implementation
- **[Vanilla TypeScript](../vanilla-ts/)** - Pure TypeScript implementation

---

**Need help?** Check the other examples in this repository or contact Omniloy support.
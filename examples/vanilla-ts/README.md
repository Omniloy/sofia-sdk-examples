# Sofia SDK – Vanilla TypeScript Integration Example

This project demonstrates how to integrate the **Sofia SDK** (a React-based web component exported as a Custom Element) into a plain TypeScript application using **Vite**, without requiring React or ReactDOM.

## 🚀 What this example shows
- Professional Sofia SDK integration in vanilla TypeScript
- Dynamic configuration with real-time debugging tools
- Complete development environment with comprehensive controls
- Handling Sofia SDK events and state management
- Professional UI with development console and monitoring tools
- Running with Vite + TypeScript 5.8

---

## 🛠️ Setup

### Prerequisites
- Node.js ≥ 18.x  
- npm ≥ 8.x or pnpm  
- Modern browser with Custom Elements support

### Configuration

**Edit `public/assets/environment.json` with your Sofia SDK credentials:**

```json
{
  "production": false,
  "sdk": {
    "baseUrl": "YOUR_BASE_URL",
    "wssUrl": "YOUR_WSS_URL",
    "apiKey": "YOUR_API_KEY", 
    "defaultUserId": "YOUR_DEFAULT_USER_ID",
    "defaultPatientId": "YOUR_DEFAULT_PATIENT_ID",
    "title": "Sofia Assistant",
    "language": "es",
    "isOpen": true,
    "onlyChat": false
  }
}
```

> **⚠️ Important**: Replace placeholder values with actual credentials provided by Omniloy.

### Installation & Run
```bash
npm install
npm run dev
# or
pnpm install
pnpm dev
```

Then open: http://localhost:5173

## ⚙️ How it works

1. **Install Sofia SDK dependency**:

```bash
npm install @omniloy/sofia-sdk@0.0.4
```

2. **Import Sofia SDK** (in main.ts):

```typescript
import '@omniloy/sofia-sdk';
```

3. **Create and configure the component** (in SofIA.ts):

```typescript
const component = document.createElement('sofia-sdk');
component.setAttribute('baseurl', 'YOUR_BASE_URL');
component.setAttribute('wssurl', 'YOUR_WSS_URL');
component.setAttribute('apikey', 'YOUR_API_KEY');
component.setAttribute('userid', 'YOUR_DEFAULT_USER_ID');
component.setAttribute('patientid', 'YOUR_DEFAULT_PATIENT_ID');
component.setAttribute('isopen', 'true');

// Set up event handlers
component.handleReport = (report: unknown) => {
  console.log('Report received:', report);
};

component.setIsOpen = (isOpen: boolean) => {
  console.log('Sofia state changed:', isOpen);
};

container.appendChild(component);
```

## Configuration

Replace placeholder values in `public/assets/environment.json` with your actual configuration:

```json
{
  "sdk": {
    "baseUrl": "YOUR_BASE_URL",
    "wssUrl": "YOUR_WSS_URL", 
    "apiKey": "YOUR_API_KEY",
    "defaultUserId": "YOUR_DEFAULT_USER_ID",
    "defaultPatientId": "YOUR_DEFAULT_PATIENT_ID"
  }
}
```

## 🎛️ Development Features

This example includes a comprehensive development environment:

- **Runtime Controls**: Open/Close Sofia, get reports, refresh component
- **State Monitor**: Real-time component status and event tracking  
- **Dynamic Editors**: Live editing of title, toolArgs, patient data, chat sources
- **Only Chat Mode**: Toggle between full interface and chat-only mode
- **Professional UI**: Clean, modern interface matching production standards

## 📂 Key Files

- **index.html** → Loads Sofia SDK via script tag from node_modules
- **src/main.ts** → Entry point with Sofia SDK import
- **src/components/SofIA.ts** → Complete integration with lifecycle, events & UI controls
- **src/utils/config.ts** → Configuration management and defaults
- **public/assets/environment.json** → Environment configuration file

## 🔍 Troubleshooting

- **Component not loading** → Ensure Sofia SDK is installed: `npm install @omniloy/sofia-sdk@0.0.4`
- **Callbacks not firing** → Check you're assigning handleReport and setIsOpen after creating the component
- **Boolean attributes** → Must be strings ("true" / "false") when using setAttribute
- **Configuration issues** → Verify environment.json has correct placeholder format

## 📦 Tech stack

- **Vite** 7
- **TypeScript** 5.8
- **Sofia SDK**: @omniloy/sofia-sdk@0.0.4
- **No framework dependencies** (pure vanilla TypeScript)

## 🌐 Browser compatibility

- **Chrome** 54+
- **Firefox** 63+
- **Safari** 10.1+
- **Edge** 79+

## 🎯 Use this example to:

1. **Learn Sofia SDK integration** in vanilla TypeScript projects
2. **Copy and adapt** the integration patterns for your own applications  
3. **Understand** the complete development workflow with debugging tools
4. **Reference** professional UI implementation and state management
5. **Test** Sofia SDK features in a controlled environment
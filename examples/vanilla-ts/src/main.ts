import './style.css';
import { SofiaSDK } from '@omniloy/sofia-sdk';
import { SofIA } from './components/SofIA';

// The SDK package declares `sideEffects: false`, so a bare
// `import '@omniloy/sofia-sdk'` is dropped from production bundles and the
// <sofia-sdk> element never registers. Import the constructor and register it
// explicitly (the guard keeps dev-server double-registration safe).
if (!customElements.get('sofia-sdk')) {
  customElements.define('sofia-sdk', SofiaSDK);
}

let app: SofIA | null = null;

async function init() {
  if (app) app.destroy();

  app = new SofIA();
  await app.init();

  if (import.meta.env.DEV) {
    (window as any).app = app;
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app?.destroy();
    app = null;
    if (import.meta.env.DEV) delete (window as any).app;
  });
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init, { once: true })
  : init();

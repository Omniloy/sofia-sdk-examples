import 'zone.js';
import { SofiaSDK } from '@omniloy/sofia-sdk';
import { bootstrapApplication } from '@angular/platform-browser';

// The SDK package declares `sideEffects: false`, so a bare
// `import '@omniloy/sofia-sdk'` is dropped from production bundles and the
// <sofia-sdk> element never registers. Import the constructor and register it
// explicitly (the guard keeps dev-server double-registration safe).
if (!customElements.get('sofia-sdk')) {
  customElements.define('sofia-sdk', SofiaSDK);
}
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

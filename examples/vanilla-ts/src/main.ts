import './style.css';
import { SofIA } from './components/SofIA';

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
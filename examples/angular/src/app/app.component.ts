import { Component, ViewEncapsulation } from '@angular/core';
import { OmniscribeDemoComponent } from './sofia.component';
// <sofia-sdk> is registered in main.ts (see the note there about sideEffects).

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    OmniscribeDemoComponent,
  ],
  encapsulation: ViewEncapsulation.None,

  template: `
    <div class="app-container">
      <sofia-demo></sofia-demo>
    </div>
  `,
})
export class AppComponent {}
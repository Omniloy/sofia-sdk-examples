import { Component, ViewEncapsulation } from '@angular/core';
import { OmniscribeDemoComponent } from './sofia.component';
import '@omniloy/sofia-sdk';

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
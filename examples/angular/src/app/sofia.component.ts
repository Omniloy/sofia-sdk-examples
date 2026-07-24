import {
  Component,
  OnInit,
  NgZone,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { environment } from '../../environment';
import { Template, TemplateExtras } from './template/Template';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { JsonPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OmniscribeElement extends HTMLElement {
  handleReport?: (report: any) => void;
  setGetLastReport?: (fn: () => Promise<unknown>) => void;
  setIsOpen?: (valueOrFn: any) => void;
  // v1.0.8 — insertion preview + EMR pre-fill
  onReportApply?: (curated: Record<string, unknown>) => void;
  updateTemplate?: () => Record<string, unknown> | null | undefined | Promise<Record<string, unknown> | null | undefined>;
  insertionPreviewClassNames?: Record<string, string>;
  // v1.0.9 — extras: per-category action buttons
  handleExtras?: (extras: Array<Record<string, unknown>>) => void;
  [key: string]: any;
}

declare global {
  interface Window {
    omniscribeHandleReport?: (report: any) => void;
    omniscribeSetGetLastReport?: (fn: () => Promise<unknown>) => void;
    omniscribeSetIsOpen?: (isOpenOrToggleFunction: any) => void;
    [key: string]: any;
  }
}

@Component({
  selector: 'sofia-demo',
  template: `
    <div class="container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div class="header-logo">
            <img src="/logo.svg" alt="Omniloy" class="omniloy-logo" />
          </div>
          <div class="header-text">
            <h1>SofIA SDK - Angular</h1>
            <p>Live development environment with dynamic configuration, real-time debugging tools, and complete SDK integration patterns. See the <a href="https://omniloy.mintlify.app/en" target="_blank" rel="noopener noreferrer">documentation</a> for more details.</p>
          </div>
        </div>
      </header>

      <!-- Configuration Error Banner -->
      <div *ngIf="configError" class="config-error-banner" style="padding:20px;margin:16px;background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;color:#991b1b;font-family:system-ui,sans-serif;">
        <strong>Configuration Error</strong>
        <p style="margin:8px 0 0">{{ configError }}</p>
        <p style="margin:8px 0 0">Contact <a href="mailto:enrique.alcazar@omniloy.com">enrique.alcazar&#64;omniloy.com</a> to obtain credentials.</p>
      </div>

      <!-- ===== SDK INTEGRATION START ===== -->
      <!-- Minimal template needed to integrate the Sofia SDK web component. -->
      <div class="sofia-wrapper">
        <sofia-sdk
          id="sofia"
          [attr.baseurl]="environment.sdk.baseUrl || null"
          [attr.apikey]="environment.sdk.apiKey"
          [attr.userid]="environment.sdk.userId"
          [attr.patientid]="environment.sdk.patientId"
          [attr.templateid]="_localTemplateId || environment.sdk.templateId"
          [attr.template]="templateStringValue"
          [attr.template-extras]="templateExtrasString"
          [attr.usermedicalspecialty]="userMedicalSpecialty || null"
          [attr.patientdata]="patientDataString"
          [attr.language]="environment.sdk.language || 'es'"
          [attr.isopen]="isOpen ? 'true' : 'false'"
          [attr.debug]="debug ? 'true' : null"
        >
        </sofia-sdk>
      </div>
      <!-- ===== SDK INTEGRATION END ===== -->

          <!-- Debug Controls -->
      <div class="debug-section">
        <div class="section-header">
          <h2>SDK Development Console</h2>
        </div>
        <div class="debug-panel">
          <!-- Component Controls -->
          <div class="control-group">
            <h3>SDK Runtime Controls</h3>
            <div class="controls">
              <button (click)="toggleIsOpen()" class="btn btn-primary">
                {{ isOpen ? 'Close' : 'Open' }} Sofia SDK
              </button>
              <button (click)="getLastReport()" [disabled]="!getLastReportFn" class="btn btn-secondary">
                Get Last Report
              </button>
            </div>
          </div>

          <!-- Status Information -->
          <div class="control-group">
            <h3>SDK State Monitor</h3>
            <div class="status-grid">
              <div class="status-item">
                <span class="status-label">Component Mounted:</span>
                <span class="status-value" [class]="componentInitialized ? 'success' : 'error'">
                  {{ componentInitialized ? 'Yes' : 'No' }}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">SDK State:</span>
                <span class="status-value" [class]="isOpen ? 'success' : 'neutral'">
                  {{ isOpen ? 'Open' : 'Closed' }}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">Report Handler:</span>
                <span class="status-value" [class]="getLastReportFn ? 'success' : 'error'">
                  {{ getLastReportFn ? 'Registered' : 'Not Available' }}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">Event Count:</span>
                <span class="status-value neutral">{{ reports.length }}</span>
              </div>
            </div>
          </div>

          <!-- Template Configuration -->
          <div class="control-group">
            <div class="tools-args-header">
              <h3>Template Configuration</h3>
              <div class="tools-args-controls">
                <button
                  (click)="toggleTemplateEditor()"
                  class="btn btn-outline">
                  {{ isEditingTemplate ? 'Cancel Edit' : 'Edit Template' }}
                </button>
                <button
                  *ngIf="isEditingTemplate"
                  (click)="applyTemplate()"
                  class="btn btn-primary"
                  [disabled]="templateError">
                  Apply Changes
                </button>
              </div>
            </div>

            <div class="tools-args-section" *ngIf="!isEditingTemplate">
              <div class="tools-args-preview">
                <h4>Current Template:</h4>
                <pre class="json-display">{{ template | json }}</pre>
              </div>

              <div class="tools-args-info">
                <div class="config-item">
                  <strong>Title:</strong> {{ template.title || 'Not set' }}
                </div>
                <div class="config-item" *ngIf="template.description">
                  <strong>Description:</strong> {{ template.description }}
                </div>
                <div class="config-item" *ngIf="template.type">
                  <strong>Type:</strong> {{ template.type }}
                </div>
                <div class="config-item" *ngIf="template.properties">
                  <strong>Properties:</strong> {{ getTemplatePropertiesCount() }} defined
                </div>
              </div>
            </div>

            <!-- Template Editor -->
            <div class="tools-args-editor" *ngIf="isEditingTemplate">
              <div class="editor-header">
                <h4>Edit Template JSON:</h4>
                <div class="editor-info" *ngIf="templateError">
                  <span class="error-message">{{ templateError }}</span>
                </div>
              </div>

              <textarea
                [(ngModel)]="templateJsonString"
                (input)="validateTemplateJson()"
                class="json-editor"
                placeholder="Enter valid JSON for template..."
                rows="15">
              </textarea>

              <div class="editor-footer">
                <small class="editor-hint">
                  Real-time JSON editor: Modify template schema and apply changes to update SDK component attributes
                </small>
              </div>
            </div>
          </div>

          <!-- Template ID -->
          <div class="control-group">
            <div class="tools-args-header">
              <h3>Template ID</h3>
              <div class="tools-args-controls">
                <button
                  (click)="updateTemplateIdFromInput()"
                  class="btn btn-primary">
                  Apply
                </button>
              </div>
            </div>
            <div class="templateid-section">
              <div class="templateid-preview">
                <span class="status-label">Current Template ID:</span>
                <span class="status-value neutral">{{ _localTemplateId || environment.sdk.templateId || 'Not set' }}</span>
              </div>
              <div class="templateid-editor">
                <input
                  type="text"
                  [value]="_localTemplateId || environment.sdk.templateId"
                  (input)="updateTemplateId($event)"
                  class="title-input"
                  placeholder="Enter template ID..." />
              </div>
            </div>
          </div>

          <!-- Debug Mode -->
          <div class="control-group">
            <div class="config-header">
              <h3>Debug Mode</h3>
            </div>
            <div class="config-section">
              <div class="toggle-control">
                <label class="toggle-label">
                  <input
                    type="checkbox"
                    [(ngModel)]="debug"
                    class="toggle-checkbox" />
                  <span class="toggle-text">{{ debug ? 'Debug Mode: ON' : 'Debug Mode: OFF' }}</span>
                </label>
                <div class="toggle-description">
                  Enable debug logging in the SDK console output
                </div>
              </div>
            </div>
          </div>

          <!-- Patient Data Configuration -->
          <div class="control-group">
            <div class="patient-data-header">
              <h3>Patient Data Configuration</h3>
              <div class="patient-data-controls">
                <button
                  (click)="togglePatientDataEditor()"
                  class="btn btn-outline">
                  {{ isEditingPatientData ? 'Cancel Edit' : 'Edit Patient Data' }}
                </button>
                <button
                  *ngIf="isEditingPatientData"
                  (click)="applyPatientData()"
                  class="btn btn-primary"
                  [disabled]="patientDataError">
                  Apply Changes
                </button>
              </div>
            </div>

            <div class="patient-data-section" *ngIf="!isEditingPatientData">
              <div class="patient-data-preview">
                <h4>Current Patient Data:</h4>
                <pre class="json-display">{{ patientData | json }}</pre>
              </div>
            </div>

            <!-- PatientData Editor -->
            <div class="patient-data-editor" *ngIf="isEditingPatientData">
              <div class="editor-header">
                <h4>Edit Patient Data JSON:</h4>
                <div class="editor-info" *ngIf="patientDataError">
                  <span class="error-message">{{ patientDataError }}</span>
                </div>
              </div>

              <textarea
                [(ngModel)]="patientDataJsonString"
                (input)="validatePatientDataJson()"
                class="json-editor"
                placeholder="Enter valid JSON for patient data..."
                rows="15">
              </textarea>

              <div class="editor-footer">
                <small class="editor-hint">
                  Dynamic patient context: Edit JSON payload and sync with SDK component patientdata attribute
                </small>
              </div>
            </div>
          </div>

          <!-- Report Data -->
          <div class="control-group" *ngIf="lastReportData || retrievedReportData || curatedReportData || lastExtrasData">
            <h3>Report Data</h3>

            <div *ngIf="lastReportData" class="data-section">
              <h4>Last Received Report:</h4>
              <pre class="json-display">{{ lastReportData | json }}</pre>
            </div>

            <div *ngIf="curatedReportData" class="data-section">
              <h4>Curated Report (onReportApply):</h4>
              <pre class="json-display">{{ curatedReportData | json }}</pre>
            </div>

            <div *ngIf="retrievedReportData" class="data-section">
              <h4>Retrieved Report Data:</h4>
              <pre class="json-display">{{ retrievedReportData | json }}</pre>
            </div>

            <div *ngIf="lastExtrasData" class="data-section">
              <h4>Extras (handleExtras):</h4>
              <pre class="json-display">{{ lastExtrasData | json }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./sofia.component.css'],
  standalone: true,
  imports: [NgIf, JsonPipe, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class OmniscribeDemoComponent implements OnInit, OnDestroy {
  environment = environment;
  template: any = Template;
  templateExtras: any = TemplateExtras;
  patientData: any = {
    extraData: {
      clinical_notes: 'Patient has celiac disease and diabetes',
      allergies: 'pollen',
      medications: 'metformin, insulin'
    },
    fullName: 'John Doe',
    birthDate: '01/15/1980',
    phone: '+1 555-123-4567',
    address: '123 Main St, Example City, USA'
  };

  // Component state
  isOpen: boolean = true;
  debug: boolean = environment.sdk.debug ?? false;
  lastReportData: any = null;
  retrievedReportData: any = null;
  curatedReportData: any = null;
  lastExtrasData: any = null;
  componentInitialized: boolean = false;
  reports: any[] = [];

  // Template editing
  isEditingTemplate: boolean = false;
  templateJsonString: string = '';
  templateError: string = '';

  // PatientData editing
  isEditingPatientData: boolean = false;
  patientDataJsonString: string = '';
  patientDataError: string = '';

  // Private properties
  private eventListeners: Array<{element: HTMLElement, event: string, handler: EventListener}> = [];
  getLastReportFn: (() => Promise<unknown>) | null = null;

  constructor(private zone: NgZone, private cdr: ChangeDetectorRef) {
    this.setupGlobalFunctions();
    this.templateJsonString = JSON.stringify(this.template, null, 2);
    this.patientDataJsonString = JSON.stringify(this.patientData, null, 2);
  }

  /** Configuration error message, if any */
  configError: string = '';

  ngOnInit() {
    this.validateConfig();
    this.setupComponentWithRetry(5, 300);
  }

  private validateConfig() {
    const placeholders = ['YOUR_API_KEY', 'YOUR_DEFAULT_USER_ID', 'YOUR_DEFAULT_PATIENT_ID', 'YOUR_TEMPLATE_ID'];
    const sdk = this.environment.sdk;
    const invalid = Object.entries(sdk).filter(
      ([, value]) => typeof value === 'string' && placeholders.includes(value as string)
    );

    if (invalid.length > 0) {
      const fields = invalid.map(([key]) => key).join(', ');
      this.configError = `Placeholder credentials detected for: ${fields}. Copy environment.example.ts to environment.ts and replace placeholder values with your credentials.`;
      console.error(`⚠️ Sofia SDK Configuration Error: ${this.configError} Contact enrique.alcazar@omniloy.com to obtain credentials.`);
    }
  }

  ngOnDestroy() {
    this.removeAllEventListeners();

    // Clean up MutationObserver
    const component = document.getElementById('sofia');
    if (component && (component as any)._mutationObserver) {
      (component as any)._mutationObserver.disconnect();
    }

    // Clean up global functions to prevent memory leaks
    if (window.omniscribeHandleReport)
      window.omniscribeHandleReport = undefined;
    if (window.omniscribeSetIsOpen)
      window.omniscribeSetIsOpen = undefined;
    if (window.omniscribeSetGetLastReport)
      window.omniscribeSetGetLastReport = undefined;
  }

  /**
   * Sets up global functions that the web component can call
   */
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
        this.updateComponentAttribute();
        this.cdr.detectChanges();
      });
    };

    window.omniscribeSetGetLastReport = (fn: () => Promise<unknown>) => {
      this.zone.run(() => {
        if (typeof fn === 'function') {
          this.getLastReportFn = fn;
          this.cdr.detectChanges();
        } else {
          console.warn('setGetLastReport expects a function, received:', typeof fn);
        }
      });
    };
  }

  /**
   * Attempts to set up the component with retries
   */
  private setupComponentWithRetry(maxAttempts: number, baseDelay: number) {
    let attempts = 0;
    const trySetup = () => {
      attempts++;
      const component = document.getElementById('sofia');

      if (component && !this.componentInitialized) {
        this.setupOmniscribeComponent(component as OmniscribeElement);
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(trySetup, baseDelay * attempts);
      } else {
        console.error('Failed to initialize Sofia component after ' + maxAttempts + ' attempts');
      }
    };

    trySetup();
  }

  /**
   * Sets up the Omniscribe component with event listeners and properties
   */
  private setupOmniscribeComponent(component: OmniscribeElement) {
    // ===== SDK INTEGRATION START =====
    // Set the three required callbacks on the sofia-sdk element.

    // 1. handleReport — receives generated reports
    component.handleReport = (report: any) => {
      if (window.omniscribeHandleReport)
        window.omniscribeHandleReport(report);
    };

    // 2. setIsOpen — controls widget visibility
    component.setIsOpen = (valueOrFn: any) => {
      if (window.omniscribeSetIsOpen)
        window.omniscribeSetIsOpen(valueOrFn);
    };

    // 3. setGetLastReport — exposes async function to retrieve last report
    component.setGetLastReport = (fn: () => Promise<unknown>) => {
      if (window.omniscribeSetGetLastReport)
        window.omniscribeSetGetLastReport(fn);
    };

    // 4. onReportApply (v1.0.8) — receives the curated report when the doctor
    //    clicks Apply in the insertion preview modal. The modal only renders
    //    when it is enabled for your API key on the backend; otherwise reports
    //    arrive via handleReport above.
    component.onReportApply = (curated: Record<string, unknown>) => {
      this.zone.run(() => {
        this.curatedReportData = curated;
        this.reports.push(curated);
        this.cdr.detectChanges();
      });
    };

    // 5. updateTemplate (v1.0.8) — hand SofIA whatever the doctor already typed
    //    in your EMR form so regeneration integrates it (keys must match the
    //    template property ids). Empty/unknown keys are skipped by the SDK.
    component.updateTemplate = () => ({
      reason_for_consultation: 'Follow-up for hypertension; patient reports occasional headaches.',
      treatment_plan: 'Continue current antihypertensive; review blood pressure log in 2 weeks.',
    });

    // 6. insertionPreviewClassNames (v1.0.8) — optional host-side styling for the
    //    insertion preview modal (it renders inside the SDK shadow DOM).
    component.insertionPreviewClassNames = { panel: 'sofia-preview-panel' };

    // 7. handleExtras (v1.0.9) — fired when the user clicks an extras category
    //    button (defined by the template-extras attribute). Items arrive exactly
    //    as the schema produced them — a real EMR would map them to
    //    orders/bookings; the dev console just displays them.
    component.handleExtras = (extras: Array<Record<string, unknown>>) => {
      this.zone.run(() => {
        this.lastExtrasData = extras;
        this.cdr.detectChanges();
      });
    };

    // ===== SDK INTEGRATION END =====

    // Add event listeners for all possible Sofia events
    this.addEventListenerWithCleanup(component, 'handle-report', (event: any) => {
      if (window.omniscribeHandleReport)
        window.omniscribeHandleReport(event.detail);
    });

    this.addEventListenerWithCleanup(component, 'set-is-open', (event: any) => {
      if (window.omniscribeSetIsOpen)
        window.omniscribeSetIsOpen(event.detail);
    });

    this.addEventListenerWithCleanup(component, 'set-get-last-report', (event: any) => {
      if (window.omniscribeSetGetLastReport)
        window.omniscribeSetGetLastReport(event.detail);
    });

    // Listen for isopen changes from the Sofia component
    this.addEventListenerWithCleanup(component, 'isopen-changed', (event: any) => {
      this.zone.run(() => {
        this.isOpen = !!event.detail;
        this.cdr.detectChanges();
      });
    });

    // Listen for any attribute changes using MutationObserver
    this.setupMutationObserver(component);

    this.componentInitialized = true;
    this.cdr.detectChanges();
  }

  /**
   * Sets up a MutationObserver to watch for attribute changes on Sofia component
   */
  private setupMutationObserver(component: HTMLElement) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'isopen') {
          this.zone.run(() => {
            const newValue = component.getAttribute('isopen');
            const newIsOpen = newValue === 'true';
            if (this.isOpen !== newIsOpen) {
              this.isOpen = newIsOpen;
              this.cdr.detectChanges();
            }
          });
        }
      });
    });

    observer.observe(component, {
      attributes: true,
      attributeFilter: ['isopen']
    });

    // Store observer for cleanup
    (component as any)._mutationObserver = observer;
  }

  /**
   * Updates the isOpen state based on a value or function
   */
  private updateIsOpenState(valueOrFn: any) {
    if (typeof valueOrFn === 'function') {
      try {
        this.isOpen = !!valueOrFn(this.isOpen);
      } catch (err) {
        this.isOpen = !this.isOpen;
        console.warn('Error calling isOpen function, defaulting to toggle:', err);
      }
    } else {
      this.isOpen = !!valueOrFn;
    }
  }

  /**
   * Updates the isopen attribute on the component
   */
  private updateComponentAttribute() {
    const component = document.getElementById('sofia');
    if (component) {
      component.setAttribute('isopen', this.isOpen ? 'true' : 'false');
    }
  }

  /**
   * Adds an event listener and tracks it for cleanup
   */
  private addEventListenerWithCleanup(element: HTMLElement, event: string, handler: EventListener) {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  /**
   * Removes all tracked event listeners
   */
  private removeAllEventListeners() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  // Public methods for UI interactions

  /**
   * Debug function to toggle the isOpen state
   */
  toggleIsOpen() {
    this.isOpen = !this.isOpen;
    this.updateComponentAttribute();
  }

  /**
   * Gets the last report from the registered async function
   */
  async getLastReport() {
    if (this.getLastReportFn) {
      try {
        const report = await this.getLastReportFn();
        this.zone.run(() => {
          this.retrievedReportData = report;
          this.cdr.detectChanges();
        });
      } catch (error) {
        console.error('Error getting report:', error);
        this.zone.run(() => {
          this.retrievedReportData = {
            error: 'Error getting report',
            message: error instanceof Error ? error.message : String(error)
          };
          this.cdr.detectChanges();
        });
      }
    } else {
      console.warn('No getLastReport function registered');
      this.retrievedReportData = {
        error: 'No function registered',
        message: 'El componente Sofia no ha registrado su función getLastReport aún'
      };
    }
  }


  /**
   * Toggles the template editor
   */
  toggleTemplateEditor() {
    this.isEditingTemplate = !this.isEditingTemplate;
    if (this.isEditingTemplate) {
      // Reset to current template when starting to edit
      this.templateJsonString = JSON.stringify(this.template, null, 2);
      this.templateError = '';
    }
  }

  /**
   * Validates the JSON in the template editor
   */
  validateTemplateJson() {
    try {
      JSON.parse(this.templateJsonString);
      this.templateError = '';
    } catch (error) {
      this.templateError = error instanceof Error ? error.message : 'Invalid JSON';
    }
  }

  /**
   * Applies the edited template to the component
   */
  applyTemplate() {
    try {
      const newTemplate = JSON.parse(this.templateJsonString);

      // Update the template property
      this.template = newTemplate;

      // Update the component attribute
      this.updateComponentTemplate();

      // Exit editing mode
      this.isEditingTemplate = false;
      this.templateError = '';

    } catch (error) {
      this.templateError = error instanceof Error ? error.message : 'Failed to apply template';
      console.error('Error applying template:', error);
    }
  }

  /**
   * Updates the template attribute on the Sofia component
   */
  private updateComponentTemplate() {
    const component = document.getElementById('sofia');
    if (component) {
      component.setAttribute('template', JSON.stringify(this.template));
    } else {
      console.warn('Sofia component not found, could not update template');
    }
  }

  /**
   * Updates the templateid attribute on the Sofia component
   */
  updateTemplateId(event: Event) {
    const input = event.target as HTMLInputElement;
    this._pendingTemplateId = input.value;
  }

  /**
   * Applies the pending template ID to the component
   */
  _localTemplateId?: string;
  private _pendingTemplateId?: string;

  updateTemplateIdFromInput() {
    const component = document.getElementById('sofia');
    if (component && this._pendingTemplateId !== undefined) {
      component.setAttribute('templateid', this._pendingTemplateId);
      this._localTemplateId = this._pendingTemplateId;
    }
  }

  /**
   * Toggles the patientData editor
   */
  togglePatientDataEditor() {
    this.isEditingPatientData = !this.isEditingPatientData;
    if (this.isEditingPatientData) {
      // Reset to current patientData when starting to edit
      this.patientDataJsonString = JSON.stringify(this.patientData, null, 2);
      this.patientDataError = '';
    }
  }

  /**
   * Validates the JSON in the patientData editor
   */
  validatePatientDataJson() {
    try {
      JSON.parse(this.patientDataJsonString);
      this.patientDataError = '';
    } catch (error) {
      this.patientDataError = error instanceof Error ? error.message : 'Invalid JSON';
    }
  }

  /**
   * Applies the edited patientData to the component
   */
  applyPatientData() {
    try {
      const newPatientData = JSON.parse(this.patientDataJsonString);

      // Update the patientData property
      this.patientData = newPatientData;

      // Update the component attribute
      this.updateComponentPatientData();

      // Exit editing mode
      this.isEditingPatientData = false;
      this.patientDataError = '';

    } catch (error) {
      this.patientDataError = error instanceof Error ? error.message : 'Failed to apply patient data';
      console.error('Error applying patientData:', error);
    }
  }

  /**
   * Updates the patientdata attribute on the Sofia component
   */
  private updateComponentPatientData() {
    const component = document.getElementById('sofia');
    if (component) {
      component.setAttribute('patientdata', JSON.stringify(this.patientData));
    } else {
      console.warn('Sofia component not found, could not update patientdata');
    }
  }

  // Getters for stringified values
  get templateStringValue(): string {
    return JSON.stringify(this.template);
  }

  get templateExtrasString(): string {
    return JSON.stringify(this.templateExtras);
  }

  // Optional (v1.0.9). Cast keeps compilation working with environment.ts files
  // that predate the userMedicalSpecialty field.
  get userMedicalSpecialty(): string {
    return (this.environment.sdk as { userMedicalSpecialty?: string }).userMedicalSpecialty ?? '';
  }

  get patientDataString(): string {
    return JSON.stringify(this.patientData);
  }


  // Helper methods for UI
  getTemplatePropertiesCount(): number {
    return this.template.properties ? Object.keys(this.template.properties).length : 0;
  }

}

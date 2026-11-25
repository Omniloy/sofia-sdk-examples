import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild
} from '@angular/core';
import { JsonPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environment';
import { EventSubscriptions, Template, TemplateExtras } from './template/Template';

/**
 * Activity event delivered to `onEvent` (SDK 1.0.11+). Payloads are PHI-free:
 * only enums, booleans and numbers — never clinical text or identifiers.
 */
interface SdkEvent {
  /** e.g. 'recording.started', 'report.settled', 'activity.typing' */
  name: string;
  family: 'recording' | 'activity' | 'report' | 'lifecycle';
  level: 'info' | 'warn' | 'error';
  /** ISO-8601 timestamp */
  ts: string;
  /** Monotonic per page load */
  seq: number;
  sdkVersion: string;
  sessionId: string | null;
  payload: Record<string, unknown>;
}

/** Callback properties the `<sofia-sdk>` element accepts. */
interface SofiaElement extends HTMLElement {
  handleReport?: (report: unknown) => void;
  setIsOpen?: (valueOrFn: boolean | ((prev: boolean) => boolean)) => void;
  setGetLastReport?: (fn: () => Promise<unknown>) => void;
  // v1.0.8 — insertion preview + EMR pre-fill
  onReportApply?: (curated: Record<string, unknown>) => void;
  updateTemplate?: () => Record<string, unknown> | null | undefined | Promise<Record<string, unknown> | null | undefined>;
  insertionPreviewClassNames?: Record<string, string>;
  // v1.0.9 — extras: per-category action buttons
  handleExtras?: (extras: Array<Record<string, unknown>>) => void;
  // v1.0.11 — activity stream
  onEvent?: (event: SdkEvent) => void;
}

// How many SDK events the dev console keeps on screen.
const MAX_EVENT_LOG = 50;

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
          #sofia
          [attr.baseurl]="environment.sdk.baseUrl || null"
          [attr.apikey]="environment.sdk.apiKey"
          [attr.userid]="environment.sdk.userId"
          [attr.patientid]="environment.sdk.patientId"
          [attr.templateid]="templateId"
          [attr.template]="templateStringValue"
          [attr.template-extras]="templateExtrasString"
          [attr.usermedicalspecialty]="userMedicalSpecialty || null"
          [attr.hisversion]="hisVersion || null"
          [attr.event-subscriptions]="eventSubscriptionsString"
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
                <span class="status-label">Reports Received:</span>
                <span class="status-value neutral">{{ reports.length }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">SDK Events:</span>
                <span class="status-value neutral">{{ sdkEventCount }}</span>
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
                  [disabled]="!!templateError">
                  Apply Changes
                </button>
              </div>
            </div>

            <div class="tools-args-section" *ngIf="!isEditingTemplate">
              <div class="tools-args-preview">
                <h4>Current Template:</h4>
                <pre class="json-display">{{ template | json }}</pre>
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
                  (click)="applyTemplateId()"
                  class="btn btn-primary">
                  Apply
                </button>
              </div>
            </div>
            <div class="templateid-section">
              <div class="templateid-preview">
                <span class="status-label">Current Template ID:</span>
                <span class="status-value neutral">{{ templateId || 'Not set' }}</span>
              </div>
              <div class="templateid-editor">
                <input
                  type="text"
                  [(ngModel)]="templateIdInput"
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
                  [disabled]="!!patientDataError">
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

          <!-- SDK Events (onEvent) -->
          <div class="control-group">
            <div class="tools-args-header">
              <h3>SDK Events (onEvent)</h3>
              <div class="tools-args-controls">
                <button (click)="clearSdkEvents()" class="btn btn-outline">
                  Clear
                </button>
              </div>
            </div>
            <pre class="json-display">{{ sdkEventsLog }}</pre>
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
              <h4>Retrieved Report:</h4>
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
export class OmniscribeDemoComponent implements AfterViewInit {
  @ViewChild('sofia') private sofia!: ElementRef<SofiaElement>;

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
    address: '123 Main St, Example City, USA',
    // Drives the consent indicator in the SDK header (enabled per API key by Omniloy)
    signedConsent: {
      signed: true,
      date: '2025-03-01'
    }
  };

  // Component state
  isOpen = true;
  debug: boolean = environment.sdk.debug ?? false;
  templateId: string = environment.sdk.templateId;
  componentInitialized = false;
  getLastReportFn: (() => Promise<unknown>) | null = null;
  reports: unknown[] = [];
  lastReportData: unknown = null;
  retrievedReportData: unknown = null;
  curatedReportData: unknown = null;
  lastExtrasData: unknown = null;
  sdkEvents: SdkEvent[] = [];
  sdkEventCount = 0;

  /** Configuration error message, if any */
  configError = '';

  // Template editing
  isEditingTemplate = false;
  templateJsonString = '';
  templateError = '';
  templateIdInput: string = environment.sdk.templateId;

  // PatientData editing
  isEditingPatientData = false;
  patientDataJsonString = '';
  patientDataError = '';

  constructor(private cdr: ChangeDetectorRef) {
    this.validateConfig();
  }

  ngAfterViewInit() {
    // ===== SDK INTEGRATION START =====
    // Angular templates cannot bind `on*` properties on custom elements, and the
    // SDK does not emit DOM events for its callbacks, so assign them as JS
    // properties on the element. The SDK calls them back inside Angular's zone,
    // so the view updates without NgZone.run().
    const component = this.sofia.nativeElement;

    // 1. handleReport — receives generated reports (fallback delivery when the
    //    insertion preview modal is off)
    component.handleReport = (report) => {
      this.lastReportData = report;
      this.reports.push(report);
    };

    // 2. setIsOpen — the SDK asks to open/collapse the widget; receives a
    //    boolean or an updater function. The [attr.isopen] binding reflects it.
    component.setIsOpen = (valueOrFn) => {
      this.isOpen = typeof valueOrFn === 'function' ? !!valueOrFn(this.isOpen) : !!valueOrFn;
    };

    // 3. setGetLastReport — exposes an async function to retrieve the last report
    component.setGetLastReport = (fn) => {
      this.getLastReportFn = fn;
    };

    // 4. onReportApply (v1.0.8) — receives the curated report when the doctor
    //    clicks Apply in the insertion preview modal. The modal only renders
    //    when it is enabled for your API key on the backend; otherwise reports
    //    arrive via handleReport above.
    component.onReportApply = (curated) => {
      this.curatedReportData = curated;
      this.reports.push(curated);
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
    component.handleExtras = (extras) => {
      this.lastExtrasData = extras;
    };

    // 8. onEvent (v1.0.11) — typed, PHI-free activity events, filtered by the
    //    event-subscriptions attribute. A real host uses them to drive an
    //    inactivity timeout, e.g. keep the session alive on 'recording.heartbeat'
    //    (every ~30s while audio flows) and never close the widget between
    //    'report.generation_started' and 'report.settled'. The dev console just
    //    logs them.
    component.onEvent = (event) => {
      this.sdkEventCount += 1;
      this.sdkEvents = [event, ...this.sdkEvents].slice(0, MAX_EVENT_LOG);
    };
    // ===== SDK INTEGRATION END =====

    this.componentInitialized = true;
    // The flag changed after the view was checked; run one more pass.
    this.cdr.detectChanges();
  }

  private validateConfig() {
    const placeholders = ['YOUR_API_KEY', 'YOUR_DEFAULT_USER_ID', 'YOUR_DEFAULT_PATIENT_ID', 'YOUR_TEMPLATE_ID'];
    const invalid = Object.entries(this.environment.sdk).filter(
      ([, value]) => typeof value === 'string' && placeholders.includes(value)
    );

    if (invalid.length > 0) {
      const fields = invalid.map(([key]) => key).join(', ');
      this.configError = `Placeholder credentials detected for: ${fields}. Copy environment.example.ts to environment.ts and replace placeholder values with your credentials.`;
      console.error(`⚠️ Sofia SDK Configuration Error: ${this.configError} Contact enrique.alcazar@omniloy.com to obtain credentials.`);
    }
  }

  // ===== Dev console actions =====

  toggleIsOpen() {
    this.isOpen = !this.isOpen;
  }

  async getLastReport() {
    if (!this.getLastReportFn) return;
    try {
      this.retrievedReportData = await this.getLastReportFn();
    } catch (error) {
      console.error('Error getting last report:', error);
      this.retrievedReportData = {
        error: 'Error getting report',
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  clearSdkEvents() {
    this.sdkEvents = [];
    this.sdkEventCount = 0;
  }

  toggleTemplateEditor() {
    this.isEditingTemplate = !this.isEditingTemplate;
    if (this.isEditingTemplate) {
      this.templateJsonString = JSON.stringify(this.template, null, 2);
      this.templateError = '';
    }
  }

  validateTemplateJson() {
    try {
      JSON.parse(this.templateJsonString);
      this.templateError = '';
    } catch (error) {
      this.templateError = error instanceof Error ? error.message : 'Invalid JSON';
    }
  }

  /** Applies the edited template; the [attr.template] binding pushes it to the SDK. */
  applyTemplate() {
    try {
      this.template = JSON.parse(this.templateJsonString);
      this.isEditingTemplate = false;
      this.templateError = '';
    } catch (error) {
      this.templateError = error instanceof Error ? error.message : 'Failed to apply template';
    }
  }

  applyTemplateId() {
    const next = this.templateIdInput.trim();
    if (next) this.templateId = next;
  }

  togglePatientDataEditor() {
    this.isEditingPatientData = !this.isEditingPatientData;
    if (this.isEditingPatientData) {
      this.patientDataJsonString = JSON.stringify(this.patientData, null, 2);
      this.patientDataError = '';
    }
  }

  validatePatientDataJson() {
    try {
      JSON.parse(this.patientDataJsonString);
      this.patientDataError = '';
    } catch (error) {
      this.patientDataError = error instanceof Error ? error.message : 'Invalid JSON';
    }
  }

  /** Applies the edited patient data; the [attr.patientdata] binding pushes it to the SDK. */
  applyPatientData() {
    try {
      this.patientData = JSON.parse(this.patientDataJsonString);
      this.isEditingPatientData = false;
      this.patientDataError = '';
    } catch (error) {
      this.patientDataError = error instanceof Error ? error.message : 'Failed to apply patient data';
    }
  }

  // ===== Values bound to <sofia-sdk> attributes =====
  // JSON props travel as JSON text when set through attributes.

  get templateStringValue(): string {
    return JSON.stringify(this.template);
  }

  get templateExtrasString(): string {
    return JSON.stringify(this.templateExtras);
  }

  get patientDataString(): string {
    return JSON.stringify(this.patientData);
  }

  // Which events onEvent receives (v1.0.11): exact names, family wildcards
  // ('recording.*') or '*'. Without a subscription the SDK delivers nothing.
  readonly eventSubscriptionsString = JSON.stringify(EventSubscriptions);

  // Optional fields. The cast keeps compilation working with environment.ts
  // files that predate them.
  private get optionalSdkEnv(): { userMedicalSpecialty?: string; hisVersion?: string } {
    return this.environment.sdk as { userMedicalSpecialty?: string; hisVersion?: string };
  }

  /** Optional (v1.0.9) — attached to tracked events for analytics. */
  get userMedicalSpecialty(): string {
    return this.optionalSdkEnv.userMedicalSpecialty ?? '';
  }

  /** Optional (v1.0.13) — version of your HIS/EMR, sent as the x-his-version header. */
  get hisVersion(): string {
    return this.optionalSdkEnv.hisVersion ?? '';
  }

  get sdkEventsLog(): string {
    return this.sdkEvents.length
      ? this.sdkEvents
          .map((e) => `${new Date(e.ts).toLocaleTimeString()}  ${e.name}  ${JSON.stringify(e.payload)}`)
          .join('\n')
      : 'No events yet — start a recording or type in the chat.';
  }
}

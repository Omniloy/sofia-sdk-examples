import { 
  Component, 
  OnInit,
  NgZone,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { environment } from '../../environment';
import { ToolArgs } from './toolArgs/ToolArgs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { JsonPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OmniscribeElement extends HTMLElement {
  handleReport?: (report: any) => void;
  setGetLastReport?: (fn: () => Promise<unknown>) => void;
  setIsOpen?: (valueOrFn: any) => void;
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
            <h1>Sofia SDK • Angular TypeScript Integration</h1>
            <p>Live development environment with dynamic configuration, real-time debugging tools, and complete SDK integration patterns</p>
          </div>
        </div>
      </header>

      <!-- Sofia Component -->
      <div class="sofia-wrapper">
        <sofia-sdk
          id="sofia"
          [attr.baseurl]="environment.omniscribe.baseUrl"
          [attr.language]="'es'"
          [attr.wssurl]="environment.omniscribe.wssUrl"
          [attr.apikey]="environment.omniscribe.apiKey"
          [attr.userid]="environment.omniscribe.defaultUserId"
          [attr.patientid]="environment.omniscribe.defaultPatientId"
          [attr.title]="sofiaTitle"
          [attr.toolsargs]="toolsArgsString"
          [attr.transcriptorselectvalues]="transcriptorSelectValuesString"
          [attr.patientdata]="patientDataString"
          [attr.isopen]="isOpen ? 'true' : 'false'"
          [attr.chatsources]="chatSourcesString"
        >
        </sofia-sdk>
      </div>

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
              <button (click)="clearReports()" class="btn btn-outline">
                Clear Reports
              </button>
              <button (click)="refreshComponent()" class="btn btn-outline">
                Reload SDK Component
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

          <!-- Configuration Preview -->
          <div class="control-group">
            <h3>Runtime Configuration</h3>
            <div class="config-preview">
              <div class="config-item">
                <strong>Base URL:</strong> {{ environment.omniscribe.baseUrl || 'Not set' }}
              </div>
              <div class="config-item">
                <strong>WebSocket URL:</strong> {{ environment.omniscribe.wssUrl || 'Not set' }}
              </div>
              <div class="config-item">
                <strong>API Key:</strong> {{ maskedApiKey }}
              </div>
              <div class="config-item">
                <strong>User ID:</strong> {{ environment.omniscribe.defaultUserId || 'Not set' }}
              </div>
              <div class="config-item">
                <strong>Patient ID:</strong> {{ environment.omniscribe.defaultPatientId || 'Not set' }}
              </div>
              <div class="config-item">
                <strong>Language:</strong> Spanish (es)
              </div>
              <div class="config-item">
                <strong>Chat Sources:</strong> {{ chatSources || 'Not set' }}
              </div>
            </div>
          </div>

          <!-- Sofia Title -->
          <div class="control-group">
            <div class="tools-args-header">
              <h3>Component Title Attribute</h3>
              <div class="tools-args-controls">
                <button 
                  (click)="toggleTitleEditor()" 
                  class="btn btn-outline">
                  {{ isEditingTitle ? 'Cancel Edit' : 'Edit Title' }}
                </button>
                <button 
                  *ngIf="isEditingTitle" 
                  (click)="applyTitle()" 
                  class="btn btn-primary"
                  [disabled]="titleError">
                  Apply Changes
                </button>
              </div>
            </div>
            
            <div class="title-section" *ngIf="!isEditingTitle">
              <div class="title-preview">
                <h4>Current Title:</h4>
                <div class="title-display">{{ sofiaTitle }}</div>
              </div>
            </div>

            <div class="title-editor" *ngIf="isEditingTitle">
              <div class="editor-section">
                <h4>Edit Title:</h4>
                <input 
                  type="text" 
                  [(ngModel)]="titleString" 
                  (input)="validateTitle()"
                  class="title-input"
                  placeholder="Enter Sofia component title..."
                  maxlength="100" />
                <div *ngIf="titleError" class="error-message">{{ titleError }}</div>
                <div class="title-help">
                  Set custom title attribute for the Sofia web component (max 100 chars)
                </div>
              </div>
            </div>
          </div>

          <!-- Tools Arguments -->
          <div class="control-group">
            <div class="tools-args-header">
              <h3>Tool Schema Configuration (toolArgs)</h3>
              <div class="tools-args-controls">
                <button 
                  (click)="toggleToolArgsEditor()" 
                  class="btn btn-outline">
                  {{ isEditingToolArgs ? 'Cancel Edit' : 'Edit toolArgs' }}
                </button>
                <button 
                  *ngIf="isEditingToolArgs" 
                  (click)="applyToolArgs()" 
                  class="btn btn-primary"
                  [disabled]="toolArgsError">
                  Apply Changes
                </button>
              </div>
            </div>
            
            <div class="tools-args-section" *ngIf="!isEditingToolArgs">
              <div class="tools-args-preview">
                <h4>Current toolArgs:</h4>
                <pre class="json-display">{{ toolsArgs | json }}</pre>
              </div>
              
              <div class="tools-args-info">
                <div class="config-item">
                  <strong>Title:</strong> {{ toolsArgs.title || 'Not set' }}
                </div>
                <div class="config-item" *ngIf="toolsArgs.description">
                  <strong>Description:</strong> {{ toolsArgs.description }}
                </div>
                <div class="config-item" *ngIf="toolsArgs.type">
                  <strong>Type:</strong> {{ toolsArgs.type }}
                </div>
                <div class="config-item" *ngIf="toolsArgs.properties">
                  <strong>Properties:</strong> {{ getToolArgsPropertiesCount() }} defined
                </div>
              </div>
            </div>

            <!-- ToolArgs Editor -->
            <div class="tools-args-editor" *ngIf="isEditingToolArgs">
              <div class="editor-header">
                <h4>Edit toolArgs JSON:</h4>
                <div class="editor-info" *ngIf="toolArgsError">
                  <span class="error-message">{{ toolArgsError }}</span>
                </div>
              </div>
              
              <textarea 
                [(ngModel)]="toolArgsJsonString"
                (input)="validateToolArgsJson()"
                class="json-editor"
                placeholder="Enter valid JSON for toolArgs..."
                rows="15">
              </textarea>
              
              <div class="editor-footer">
                <small class="editor-hint">
                                    💡 Real-time JSON editor: Modify toolArgs schema and apply changes to update SDK component attributes
                </small>
              </div>
            </div>
          </div>

          <!-- Patient Data -->
          <div class="control-group">
            <div class="patient-data-header">
              <h3>Patient Context Data (patientData)</h3>
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
                  💡 Dynamic patient context: Edit JSON payload and sync with SDK component patientdata attribute
                </small>
              </div>
            </div>
          </div>

          <!-- Chat Sources -->
          <div class="control-group">
            <div class="patient-data-header">
              <h3>Chat Sources Configuration</h3>
              <div class="patient-data-controls">
                <button 
                  (click)="toggleChatSourcesEditor()" 
                  class="btn btn-outline">
                  {{ isEditingChatSources ? 'Cancel Edit' : 'Edit Chat Sources' }}
                </button>
                <button 
                  *ngIf="isEditingChatSources" 
                  (click)="applyChatSources()" 
                  class="btn btn-primary"
                  [disabled]="chatSourcesError">
                  Apply Changes
                </button>
              </div>
            </div>
            
            <div class="patient-data-section" *ngIf="!isEditingChatSources">
              <div class="patient-data-preview">
                <h4>Current Chat Sources:</h4>
                <div class="chat-sources-display">{{ chatSources || 'Not set' }}</div>
              </div>
            </div>

            <div class="patient-data-editor" *ngIf="isEditingChatSources">
              <div class="editor-section">
                <h4>Edit Chat Sources:</h4>
                <input 
                  type="text" 
                  [(ngModel)]="chatSourcesString" 
                  (input)="validateChatSources()"
                  class="chat-sources-input"
                  placeholder="Enter chat sources configuration..."
                  maxlength="500" />
                <div *ngIf="chatSourcesError" class="error-message">{{ chatSourcesError }}</div>
                
                <div class="editor-footer">
                  <small class="editor-hint">
                    💡 Chat sources configuration: Set the sources for chat functionality (max 500 chars)
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Only Chat Control -->
          <div class="control-group">
            <div class="config-header">
              <h3>Only Chat Mode</h3>
            </div>
            <div class="config-section">
              <div class="toggle-control">
                <label class="toggle-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="onlyChat" 
                    (change)="updateOnlyChat()"
                    class="toggle-checkbox" />
                  <span class="toggle-text">{{ onlyChat ? 'Only Chat Mode: ON' : 'Only Chat Mode: OFF' }}</span>
                </label>
                <div class="toggle-description">
                  {{ onlyChat ? 'Chat interface only, no additional features' : 'Full interface with all features' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Report Data -->
          <div class="control-group" *ngIf="lastReportData || retrievedReportData">
            <h3>Report Data</h3>
            
            <div *ngIf="lastReportData" class="data-section">
              <h4>Last Received Report:</h4>
              <pre class="json-display">{{ lastReportData | json }}</pre>
            </div>
            
            <div *ngIf="retrievedReportData" class="data-section">
              <h4>Retrieved Report Data:</h4>
              <pre class="json-display">{{ retrievedReportData | json }}</pre>
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
  toolsArgs = ToolArgs;
  transcriptorSelectValues = [
    { value: 'transcription', label: 'Transcription' },
  ];
  patientData = {
    extraData: {
      illness: 'es celíaco',
      patient_medical_notes: {
        notes: [
          {
            episodeId: 1234,
            date: '08/10/2025',
            service: 'NEUROLOGIA',
            ambit: 'CONSULTAS EXTERNAS',
            doctor: 'Dr. Smith',
            text: 'El paciente presentaba mucho dolor de cabeza.',
            severity: 'Unknown',
            url: 'https://url-to-note.com',
          }
        ]
      },
      medical_practice: 'Urgencias',
    },
    fullName: 'John Doe',
    birthDate: '01/15/1980',
    phone: '555-123-4567',
    address: '123 Main St, Example City'
  };
  
  // Component state
  isOpen: boolean = true;
  lastReportData: any = null;
  retrievedReportData: any = null;
  componentInitialized: boolean = false;
  reports: any[] = [];
  
  // Title editing
  sofiaTitle: string = 'Sofia Assistant';
  isEditingTitle: boolean = false;
  titleString: string = '';
  titleError: string = '';
  
  // ToolArgs editing
  isEditingToolArgs: boolean = false;
  toolArgsJsonString: string = '';
  toolArgsError: string = '';
  
  // PatientData editing
  isEditingPatientData: boolean = false;
  patientDataJsonString: string = '';
  patientDataError: string = '';
  
  // ChatSources editing
  chatSources: string = '';
  isEditingChatSources: boolean = false;
  chatSourcesString: string = '';
  chatSourcesError: string = '';
  
  // OnlyChat control
  onlyChat: boolean = false;
  
  // Private properties
  private eventListeners: Array<{element: HTMLElement, event: string, handler: EventListener}> = [];
  getLastReportFn: (() => Promise<unknown>) | null = null;

  constructor(private zone: NgZone, private cdr: ChangeDetectorRef) {
    this.setupGlobalFunctions();
    this.toolArgsJsonString = JSON.stringify(this.toolsArgs, null, 2);
    this.patientDataJsonString = JSON.stringify(this.patientData, null, 2);
    this.titleString = this.sofiaTitle;
    
    // Handle chatsources as JSON array
    const chatSourcesValue = this.environment.omniscribe.chatsources;
    if (Array.isArray(chatSourcesValue)) {
      this.chatSources = JSON.stringify(chatSourcesValue);
    } else {
      this.chatSources = chatSourcesValue || '[]';
    }
    this.chatSourcesString = this.chatSources;
  }

  ngOnInit() {
    this.setupComponentWithRetry(5, 300);
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
    console.log('setupOmniscribeComponent called with component:', component);
    // Direct property assignments with proper typing
    component.handleReport = (report: any) => {
      if (window.omniscribeHandleReport)
        window.omniscribeHandleReport(report);
    };
    
    component.setIsOpen = (valueOrFn: any) => {
      if (window.omniscribeSetIsOpen)
        window.omniscribeSetIsOpen(valueOrFn);
    };

    component.setGetLastReport = (fn: () => Promise<unknown>) => {
      if (window.omniscribeSetGetLastReport)
        window.omniscribeSetGetLastReport(fn);
    };
    
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
    
    // Set the onlychat attribute programmatically to avoid Angular binding issues
    component.setAttribute('onlychat', this.onlyChat ? 'true' : 'false');
    
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
   * Clears all report data
   */
  clearReports() {
    this.lastReportData = null;
    this.retrievedReportData = null;
    this.reports = [];
  }

  /**
   * Refreshes the component by reinitializing it
   */
  refreshComponent() {
    this.componentInitialized = false;
    this.getLastReportFn = null;
    this.setupComponentWithRetry(5, 300);
  }

  /**
   * Toggles the toolArgs editor
   */
  toggleToolArgsEditor() {
    this.isEditingToolArgs = !this.isEditingToolArgs;
    if (this.isEditingToolArgs) {
      // Reset to current toolArgs when starting to edit
      this.toolArgsJsonString = JSON.stringify(this.toolsArgs, null, 2);
      this.toolArgsError = '';
    }
  }

  /**
   * Validates the JSON in the toolArgs editor
   */
  validateToolArgsJson() {
    try {
      JSON.parse(this.toolArgsJsonString);
      this.toolArgsError = '';
    } catch (error) {
      this.toolArgsError = error instanceof Error ? error.message : 'Invalid JSON';
    }
  }

  /**
   * Applies the edited toolArgs to the component
   */
  applyToolArgs() {
    try {
      const newToolArgs = JSON.parse(this.toolArgsJsonString);
      
      // Update the toolsArgs property
      this.toolsArgs = newToolArgs;
      
      // Update the component attribute
      this.updateComponentToolArgs();
      
      // Exit editing mode
      this.isEditingToolArgs = false;
      this.toolArgsError = '';
      
    } catch (error) {
      this.toolArgsError = error instanceof Error ? error.message : 'Failed to apply toolArgs';
      console.error('Error applying toolArgs:', error);
    }
  }

  /**
   * Updates the toolsargs attribute on the Sofia component
   */
  private updateComponentToolArgs() {
    const component = document.getElementById('sofia');
    if (component) {
      component.setAttribute('toolsargs', JSON.stringify(this.toolsArgs));
    } else {
      console.warn('Sofia component not found, could not update toolsargs');
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

  /**
   * Toggles the title editor
   */
  toggleTitleEditor() {
    this.isEditingTitle = !this.isEditingTitle;
    if (this.isEditingTitle) {
      // Reset to current title when starting to edit
      this.titleString = this.sofiaTitle;
      this.titleError = '';
    }
  }

  /**
   * Validates the title input
   */
  validateTitle() {
    if (this.titleString.trim().length === 0) {
      this.titleError = 'Title cannot be empty';
    } else if (this.titleString.length > 100) {
      this.titleError = 'Title cannot exceed 100 characters';
    } else {
      this.titleError = '';
    }
  }

  /**
   * Applies the edited title to the component
   */
  applyTitle() {
    this.validateTitle();
    if (this.titleError) {
      return;
    }

    try {
      // Update the title property
      this.sofiaTitle = this.titleString.trim();
      
      // Update the component attribute
      this.updateComponentTitle();
      
      // Exit editing mode
      this.isEditingTitle = false;
      this.titleError = '';
      
    } catch (error) {
      this.titleError = error instanceof Error ? error.message : 'Failed to apply title';
      console.error('Error applying title:', error);
    }
  }

  /**
   * Updates the title attribute on the Sofia component
   */
  private updateComponentTitle() {
    const component = document.getElementById('sofia');
    if (component) {
      component.setAttribute('title', this.sofiaTitle);
    } else {
      console.warn('Sofia component not found, could not update title');
    }
  }

  /**
   * Toggles the chat sources editor
   */
  toggleChatSourcesEditor() {
    this.isEditingChatSources = !this.isEditingChatSources;
    if (this.isEditingChatSources) {
      // Reset to current chat sources when starting to edit
      this.chatSourcesString = this.chatSources;
      this.chatSourcesError = '';
    }
  }

  /**
   * Validates the chat sources input
   */
  validateChatSources() {
    if (this.chatSourcesString.trim().length > 500) {
      this.chatSourcesError = 'Chat sources cannot exceed 500 characters';
    } else {
      this.chatSourcesError = '';
    }
  }

  /**
   * Applies the edited chat sources to the component
   */
  applyChatSources() {
    this.validateChatSources();
    if (this.chatSourcesError) {
      return;
    }

    try {
      // Update the chat sources property
      this.chatSources = this.chatSourcesString.trim();
      
      // Update the component attribute
      this.updateComponentChatSources();
      
      // Exit editing mode
      this.isEditingChatSources = false;
      this.chatSourcesError = '';
      
    } catch (error) {
      this.chatSourcesError = error instanceof Error ? error.message : 'Failed to apply chat sources';
      console.error('Error applying chat sources:', error);
    }
  }

  /**
   * Updates the chatsources attribute on the Sofia component
   */
  private updateComponentChatSources() {
    const component = document.getElementById('sofia');
    if (component) {
      component.setAttribute('chatsources', this.chatSources);
    } else {
      console.warn('Sofia component not found, could not update chatsources');
    }
  }

  /**
   * Updates the onlychat attribute on the Sofia component
   */
  updateOnlyChat() {
    const component = document.getElementById('sofia');
    if (component) {
      component.setAttribute('onlychat', this.onlyChat ? 'true' : 'false');
    } else {
      console.warn('Sofia component not found, could not update onlychat');
    }
  }

  // Getters for stringified values
  get toolsArgsString(): string {
    return JSON.stringify(this.toolsArgs);
  }

  get transcriptorSelectValuesString(): string {
    return JSON.stringify(this.transcriptorSelectValues);
  }

  get patientDataString(): string {
    return JSON.stringify(this.patientData);
  }

  get maskedApiKey(): string {
    const apiKey = this.environment.omniscribe.apiKey;
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      return 'Not set';
    }
    // Show first 4 characters and last 4 characters, mask the middle
    if (apiKey.length <= 8) {
      return '••••••••';
    }
    const start = apiKey.substring(0, 4);
    const end = apiKey.substring(apiKey.length - 4);
    const middle = '•'.repeat(Math.max(4, apiKey.length - 8));
    return `${start}${middle}${end}`;
  }

  // Helper methods for UI
  getToolArgsPropertiesCount(): number {
    return this.toolsArgs.properties ? Object.keys(this.toolsArgs.properties).length : 0;
  }

}

import { DEFAULT_CONFIG, DEFAULT_PATIENT_DATA, TEMPLATE_CONFIG } from "../utils/config";

export class SofIA {
  // Component state
  private isOpen = true;
  private component: HTMLElementTagNameMap['sofia-sdk'] | null = null;
  private componentInitialized = false;
  private reports: unknown[] = [];
  private getLastReportFn: (() => Promise<unknown>) | null = null;
  private lastReportData: unknown = null;
  private retrievedReportData: unknown = null;

  // Configuration state
  private debug = false;
  private config = { ...DEFAULT_CONFIG };
  private patientData = { ...DEFAULT_PATIENT_DATA };
  private template = { ...TEMPLATE_CONFIG };

  // Editor states
  private isEditingTemplate = false;
  private templateString = '';
  private templateError = '';

  private isEditingPatientData = false;
  private patientDataString = '';
  private patientDataError = '';

  // Event listener tracking for cleanup
  private eventListenerCleanups: Array<() => void> = [];

  async init() {
    await this.loadConfig();
    this.validateConfig();
    this.setupEventListeners();
    await this.setupComponent();
    this.updateUI();
  }

  private validateConfig() {
    const placeholders = ['YOUR_BASE_URL', 'YOUR_WSS_URL', 'YOUR_API_KEY', 'YOUR_DEFAULT_USER_ID', 'YOUR_DEFAULT_PATIENT_ID', 'YOUR_TEMPLATE_ID'];
    const invalid = Object.entries(this.config).filter(
      ([, value]) => typeof value === 'string' && placeholders.includes(value)
    );

    if (invalid.length > 0) {
      const fields = invalid.map(([key]) => key).join(', ');
      const message = `⚠️ Sofia SDK Configuration Error: Placeholder values detected for: ${fields}. Copy public/assets/environment.example.json to public/assets/environment.json and replace placeholder values with your actual credentials. Contact enrique.alcazar@omniloy.com to obtain credentials.`;
      console.error(message);

      const container = document.getElementById('sofia-container');
      if (container) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'padding:20px;margin:16px;background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;color:#991b1b;font-family:system-ui,sans-serif;';
        errorDiv.innerHTML = `<strong>Configuration Error</strong><p style="margin:8px 0 0">Placeholder credentials detected for: <code>${fields}</code></p><p style="margin:8px 0 0">Copy <code>public/assets/environment.example.json</code> to <code>public/assets/environment.json</code> and replace placeholder values with your credentials.</p><p style="margin:8px 0 0">Contact <a href="mailto:enrique.alcazar@omniloy.com">enrique.alcazar@omniloy.com</a> to obtain credentials.</p>`;
        container.appendChild(errorDiv);
      }
    }
  }

  destroy() {
    // Remove tracked event listeners
    this.eventListenerCleanups.forEach(cleanup => cleanup());
    this.eventListenerCleanups = [];

    const container = document.getElementById('sofia-container');
    if (container) container.replaceChildren();
    this.component = null;
    this.componentInitialized = false;
    this.reports = [];
    this.getLastReportFn = null;
  }

  private async loadConfig() {
    try {
      const response = await fetch('/assets/environment.json');
      if (response.ok) {
        const envData = await response.json();

        // Update config from environment.json structure
        if (envData.sdk) {
          this.config = {
            ...this.config,
            baseUrl: envData.sdk.baseUrl || this.config.baseUrl,
            wssUrl: envData.sdk.wssUrl || this.config.wssUrl,
            apiKey: envData.sdk.apiKey || this.config.apiKey,
            patientId: envData.sdk.patientId || envData.sdk.defaultPatientId || this.config.patientId,
            userId: envData.sdk.userId || envData.sdk.defaultUserId || this.config.userId,
            templateId: envData.sdk.templateId || this.config.templateId,
            language: envData.sdk.language || this.config.language,
            isOpen: envData.sdk.isOpen ?? this.config.isOpen
          };

          this.debug = envData.sdk.debug ?? false;
        }
      }
    } catch (e) {
      console.warn('Could not load environment.json, using defaults');
    }
  }

  private setupEventListeners() {
    const track = (id: string, event: string, handler: EventListener) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener(event, handler);
        this.eventListenerCleanups.push(() => el.removeEventListener(event, handler));
      }
    };

    track('toggle-open-btn', 'click', () => this.toggleIsOpen());
    track('see-report-btn', 'click', () => this.getLastReport());
    track('clear-reports-btn', 'click', () => this.clearReports());
    track('refresh-component-btn', 'click', () => this.refreshComponent());
    track('toggle-template-editor', 'click', () => this.toggleTemplateEditor());
    track('apply-template', 'click', () => this.applyTemplate());
    track('template-json-editor', 'input', () => this.validateTemplate());
    track('apply-templateid', 'click', () => this.applyTemplateId());
    track('toggle-patientdata-editor', 'click', () => this.togglePatientDataEditor());
    track('apply-patientdata', 'click', () => this.applyPatientData());
    track('patientdata-json-editor', 'input', () => this.validatePatientData());
    track('debug-toggle', 'change', () => this.updateDebug());
  }

  private async setupComponent() {
    const timeout = (ms: number) => new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Sofia SDK custom element not registered within ${ms / 1000}s. Ensure @omniloy/sofia-sdk is installed and imported.`)), ms)
    );

    try {
      await Promise.race([customElements.whenDefined('sofia-sdk'), timeout(10000)]);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Sofia SDK failed to load';
      console.error(message);
      const container = document.getElementById('sofia-container');
      if (container) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'padding:20px;margin:16px;background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;color:#991b1b;font-family:system-ui,sans-serif;';
        errorDiv.innerHTML = `<strong>SDK Load Error</strong><p style="margin:8px 0 0">${message}</p>`;
        container.appendChild(errorDiv);
      }
      return;
    }

    const container = document.getElementById('sofia-container');
    if (!container) return;

    container.replaceChildren();

    // ===== SDK INTEGRATION START =====
    // Minimal code needed to integrate the Sofia SDK web component.
    // Everything between START and END is the core integration pattern.

    const component = document.createElement('sofia-sdk');

    // 1. Set required attributes
    component.setAttribute('baseurl', this.config.baseUrl);
    component.setAttribute('wssurl', this.config.wssUrl);
    component.setAttribute('apikey', this.config.apiKey);
    component.setAttribute('userid', this.config.userId);
    component.setAttribute('patientid', this.config.patientId);
    component.setAttribute('templateid', this.config.templateId);
    component.setAttribute('template', JSON.stringify(this.template));

    // 2. Set optional attributes
    component.setAttribute('isopen', this.isOpen.toString());
    component.setAttribute('language', this.config.language || 'es');
    component.setAttribute('patientdata', JSON.stringify(this.patientData));
    if (this.debug) {
      component.setAttribute('debug', 'true');
    }

    // 3. Set required callbacks
    component.handleReport = (report: unknown) => {
      this.lastReportData = report;
      this.reports.push(report);
      this.updateUI();
      this.showReportData();
    };

    component.setIsOpen = (newState: boolean | ((prevState: boolean) => boolean)) => {
      this.isOpen = typeof newState === 'function' ? newState(this.isOpen) : newState;
      component.setAttribute('isopen', this.isOpen.toString());
      this.updateUI();
    };

    component.setGetLastReport = (fn) => {
      this.getLastReportFn = fn;
      this.updateUI();
    };

    // 4. Mount the component
    container.appendChild(component);

    // ===== SDK INTEGRATION END =====

    this.component = component;
    this.componentInitialized = true;
    this.updateUI();
  }

  private updateUI() {
    // Update component status
    const componentStatus = document.getElementById('component-status');
    if (componentStatus) {
      componentStatus.textContent = this.componentInitialized ? 'Yes' : 'No';
      componentStatus.className = `status-value ${this.componentInitialized ? 'success' : 'error'}`;
    }

    // Update SDK state
    const sdkStatus = document.getElementById('sdk-status');
    if (sdkStatus) {
      sdkStatus.textContent = this.isOpen ? 'Open' : 'Closed';
      sdkStatus.className = `status-value ${this.isOpen ? 'success' : 'neutral'}`;
    }

    // Update report handler status
    const reportHandlerStatus = document.getElementById('report-handler-status');
    if (reportHandlerStatus) {
      reportHandlerStatus.textContent = this.getLastReportFn ? 'Registered' : 'Not Available';
      reportHandlerStatus.className = `status-value ${this.getLastReportFn ? 'success' : 'error'}`;
    }

    // Update event count
    const eventCount = document.getElementById('event-count');
    if (eventCount) {
      eventCount.textContent = this.reports.length.toString();
    }

    // Update toggle button text
    const toggleText = document.getElementById('toggle-text');
    if (toggleText) {
      toggleText.textContent = this.isOpen ? 'Close Sofia SDK' : 'Open Sofia SDK';
    }

    // Update get report button state
    const reportBtn = document.getElementById('see-report-btn') as HTMLButtonElement;
    if (reportBtn) {
      reportBtn.disabled = !this.getLastReportFn;
    }

    // Update debug toggle
    const debugToggle = document.getElementById('debug-toggle') as HTMLInputElement;
    const debugText = document.getElementById('debug-text');
    if (debugToggle) {
      debugToggle.checked = this.debug;
    }
    if (debugText) {
      debugText.textContent = this.debug ? 'Debug Mode: ON' : 'Debug Mode: OFF';
    }

    // Update Template display
    const templateDisplay = document.getElementById('template-display');
    if (templateDisplay) {
      templateDisplay.textContent = JSON.stringify(this.template, null, 2);
    }

    // Update PatientData display
    const patientDataDisplay = document.getElementById('patientdata-display');
    if (patientDataDisplay) {
      patientDataDisplay.textContent = JSON.stringify(this.patientData, null, 2);
    }

    // Update templateid display
    const templateIdDisplay = document.getElementById('templateid-display');
    if (templateIdDisplay) {
      templateIdDisplay.textContent = this.config.templateId || 'Not set';
    }
  }

  private toggleIsOpen() {
    this.isOpen = !this.isOpen;
    if (this.component) {
      this.component.setAttribute('isopen', this.isOpen.toString());
    }
    this.updateUI();
  }

  private async getLastReport() {
    if (this.getLastReportFn) {
      try {
        const report = await this.getLastReportFn();
        this.retrievedReportData = report;
        this.showReportData();
      } catch (error) {
        console.error("Error getting last report:", error);
      }
    } else {
      console.warn("No getLastReport function registered");
    }
  }

  private clearReports() {
    this.reports = [];
    this.lastReportData = null;
    this.retrievedReportData = null;
    this.hideReportData();
    this.updateUI();
  }

  private refreshComponent() {
    this.destroy();
    setTimeout(() => {
      this.setupComponent();
    }, 100);
  }

  // Debug toggle
  private updateDebug() {
    const debugToggle = document.getElementById('debug-toggle') as HTMLInputElement;
    if (debugToggle) {
      this.debug = debugToggle.checked;
    }

    if (this.component) {
      if (this.debug) {
        this.component.setAttribute('debug', 'true');
      } else {
        this.component.removeAttribute('debug');
      }
    }

    this.updateUI();
  }

  // Template ID methods
  private applyTemplateId() {
    const input = document.getElementById('templateid-input') as HTMLInputElement;
    if (input && input.value.trim()) {
      this.config.templateId = input.value.trim();
      if (this.component) {
        this.component.setAttribute('templateid', this.config.templateId);
      }
      this.updateUI();
    }
  }

  private showReportData() {
    const reportSection = document.getElementById('report-data-section');
    if (reportSection) {
      reportSection.style.display = 'block';
    }

    if (this.lastReportData) {
      const lastReportSection = document.getElementById('last-report-section');
      const lastReportContent = document.getElementById('last-report-content');
      if (lastReportSection && lastReportContent) {
        lastReportSection.style.display = 'block';
        lastReportContent.textContent = JSON.stringify(this.lastReportData, null, 2);
      }
    }

    if (this.retrievedReportData) {
      const retrievedReportSection = document.getElementById('retrieved-report-section');
      const retrievedReportContent = document.getElementById('retrieved-report-content');
      if (retrievedReportSection && retrievedReportContent) {
        retrievedReportSection.style.display = 'block';
        retrievedReportContent.textContent = JSON.stringify(this.retrievedReportData, null, 2);
      }
    }
  }

  private hideReportData() {
    const reportSection = document.getElementById('report-data-section');
    const lastReportSection = document.getElementById('last-report-section');
    const retrievedReportSection = document.getElementById('retrieved-report-section');

    if (reportSection) reportSection.style.display = 'none';
    if (lastReportSection) lastReportSection.style.display = 'none';
    if (retrievedReportSection) retrievedReportSection.style.display = 'none';
  }

  // Template Editor Methods
  private toggleTemplateEditor() {
    this.isEditingTemplate = !this.isEditingTemplate;

    const templatePreview = document.getElementById('template-preview');
    const templateEditor = document.getElementById('template-editor');
    const toggleBtn = document.getElementById('toggle-template-editor');
    const applyBtn = document.getElementById('apply-template');

    if (this.isEditingTemplate) {
      this.templateString = JSON.stringify(this.template, null, 2);
      const templateTextarea = document.getElementById('template-json-editor') as HTMLTextAreaElement;
      if (templateTextarea) {
        templateTextarea.value = this.templateString;
      }

      if (templatePreview) templatePreview.style.display = 'none';
      if (templateEditor) templateEditor.style.display = 'block';
      if (toggleBtn) toggleBtn.textContent = 'Cancel Edit';
      if (applyBtn) applyBtn.style.display = 'inline-flex';
    } else {
      if (templatePreview) templatePreview.style.display = 'block';
      if (templateEditor) templateEditor.style.display = 'none';
      if (toggleBtn) toggleBtn.textContent = 'Edit Template';
      if (applyBtn) applyBtn.style.display = 'none';
      this.templateError = '';
      this.updateTemplateError();
    }
  }

  private validateTemplate() {
    const templateTextarea = document.getElementById('template-json-editor') as HTMLTextAreaElement;
    if (!templateTextarea) return;

    this.templateString = templateTextarea.value;
    this.templateError = '';

    if (this.templateString.trim().length === 0) {
      this.templateError = 'Template cannot be empty';
    } else {
      try {
        JSON.parse(this.templateString);
      } catch (e) {
        this.templateError = `Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`;
      }
    }

    this.updateTemplateError();
    this.updateTemplateApplyButtonState();
  }

  private updateTemplateError() {
    const errorElement = document.getElementById('template-error');
    const templateTextarea = document.getElementById('template-json-editor') as HTMLTextAreaElement;

    if (errorElement) {
      if (this.templateError) {
        errorElement.textContent = this.templateError;
        errorElement.style.display = 'block';
      } else {
        errorElement.style.display = 'none';
      }
    }

    if (templateTextarea) {
      templateTextarea.className = this.templateError ? 'json-editor error' : 'json-editor';
    }
  }

  private updateTemplateApplyButtonState() {
    const applyBtn = document.getElementById('apply-template') as HTMLButtonElement;
    if (applyBtn) {
      applyBtn.disabled = !!this.templateError;
    }
  }

  private applyTemplate() {
    if (this.templateError) return;

    try {
      this.template = JSON.parse(this.templateString);
      this.updateComponentTemplate();
      this.toggleTemplateEditor();
      this.updateUI();
    } catch (e) {
      console.error('Error applying template:', e);
    }
  }

  private updateComponentTemplate() {
    if (this.component) {
      this.component.setAttribute('template', JSON.stringify(this.template));
    }
  }

  // Patient Data Editor Methods
  private togglePatientDataEditor() {
    this.isEditingPatientData = !this.isEditingPatientData;

    const patientDataPreview = document.getElementById('patientdata-preview');
    const patientDataEditor = document.getElementById('patientdata-editor');
    const toggleBtn = document.getElementById('toggle-patientdata-editor');
    const applyBtn = document.getElementById('apply-patientdata');

    if (this.isEditingPatientData) {
      this.patientDataString = JSON.stringify(this.patientData, null, 2);
      const patientDataTextarea = document.getElementById('patientdata-json-editor') as HTMLTextAreaElement;
      if (patientDataTextarea) {
        patientDataTextarea.value = this.patientDataString;
      }

      if (patientDataPreview) patientDataPreview.style.display = 'none';
      if (patientDataEditor) patientDataEditor.style.display = 'block';
      if (toggleBtn) toggleBtn.textContent = 'Cancel Edit';
      if (applyBtn) applyBtn.style.display = 'inline-flex';
    } else {
      if (patientDataPreview) patientDataPreview.style.display = 'block';
      if (patientDataEditor) patientDataEditor.style.display = 'none';
      if (toggleBtn) toggleBtn.textContent = 'Edit Patient Data';
      if (applyBtn) applyBtn.style.display = 'none';
      this.patientDataError = '';
      this.updatePatientDataError();
    }
  }

  private validatePatientData() {
    const patientDataTextarea = document.getElementById('patientdata-json-editor') as HTMLTextAreaElement;
    if (!patientDataTextarea) return;

    this.patientDataString = patientDataTextarea.value;
    this.patientDataError = '';

    if (this.patientDataString.trim().length === 0) {
      this.patientDataError = 'Patient Data cannot be empty';
    } else {
      try {
        JSON.parse(this.patientDataString);
      } catch (e) {
        this.patientDataError = `Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`;
      }
    }

    this.updatePatientDataError();
    this.updatePatientDataApplyButtonState();
  }

  private updatePatientDataError() {
    const errorElement = document.getElementById('patientdata-error');
    const patientDataTextarea = document.getElementById('patientdata-json-editor') as HTMLTextAreaElement;

    if (errorElement) {
      if (this.patientDataError) {
        errorElement.textContent = this.patientDataError;
        errorElement.style.display = 'block';
      } else {
        errorElement.style.display = 'none';
      }
    }

    if (patientDataTextarea) {
      patientDataTextarea.className = this.patientDataError ? 'json-editor error' : 'json-editor';
    }
  }

  private updatePatientDataApplyButtonState() {
    const applyBtn = document.getElementById('apply-patientdata') as HTMLButtonElement;
    if (applyBtn) {
      applyBtn.disabled = !!this.patientDataError;
    }
  }

  private applyPatientData() {
    if (this.patientDataError) return;

    try {
      this.patientData = JSON.parse(this.patientDataString);
      this.updateComponentPatientData();
      this.togglePatientDataEditor();
      this.updateUI();
    } catch (e) {
      console.error('Error applying Patient Data:', e);
    }
  }

  private updateComponentPatientData() {
    if (this.component) {
      this.component.setAttribute('patientdata', JSON.stringify(this.patientData));
    }
  }

  // Public getters for debugging
  public getLastReportData(): unknown {
    return this.lastReportData;
  }

  public getReports(): unknown[] {
    return this.reports;
  }

  public getComponentState() {
    return {
      isOpen: this.isOpen,
      componentInitialized: this.componentInitialized,
      hasReportHandler: !!this.getLastReportFn,
      reportCount: this.reports.length,
      debug: this.debug
    };
  }
}

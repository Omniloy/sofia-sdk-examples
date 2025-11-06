import { DEFAULT_CONFIG, DEFAULT_PATIENT_DATA, TOOLS_CONFIG } from "../utils/config";

interface OmniscribeElement extends HTMLElement {
  handleReport?: (report: any) => void;
  setGetLastReport?: (fn: () => Promise<unknown>) => void;
  setIsOpen?: (valueOrFn: any) => void;
  [key: string]: any;
}

export class SofIA {
  // Component state
  private isOpen = true;
  private component: OmniscribeElement | null = null;
  private componentInitialized = false;
  private reports: any[] = [];
  private getLastReportFn: (() => Promise<unknown>) | null = null;
  private lastReportData: any = null;
  private retrievedReportData: any = null;

  // Configuration state
  private sofiaTitle = 'Sofia Assistant';
  private onlyChat = false;
  private config = { ...DEFAULT_CONFIG };
  private patientData = { ...DEFAULT_PATIENT_DATA };
  private toolsArgs = { ...TOOLS_CONFIG };
  private chatSources = [
    'Guías Clínicas',
    'Base de Datos de Medicamentos', 
    'Estudios Científicos',
    'Base de Datos EMA',
    'Guías OMS',
    'Guías NICE',
    'Base de Datos FDA'
  ];

  // Editor states
  private isEditingTitle = false;
  private titleString = '';
  private titleError = '';
  
  private isEditingToolArgs = false;
  private toolArgsString = '';
  private toolArgsError = '';
  
  private isEditingPatientData = false;
  private patientDataString = '';
  private patientDataError = '';
  
  private isEditingChatSources = false;
  private chatSourcesString = '';
  private chatSourcesError = '';

  async init() {
    await this.loadConfig();
    this.setupEventListeners();
    await this.setupComponent();
    this.updateUI();
  }

  destroy() {
    const container = document.getElementById('sofia-container');
    if (container) container.innerHTML = '';
    this.component = null;
    this.componentInitialized = false;
    this.reports = [];
    this.getLastReportFn = null;
  }

  private async loadConfig() {
    try {
      const response = await fetch('/assets/environment.json');
      if (response.ok) {
        const loadedConfig = await response.json();
        this.config = { ...this.config, ...loadedConfig };
      }
    } catch (e) {
      // Using default configuration
    }
  }

  private setupEventListeners() {
    // Toggle SDK open/close
    const toggleBtn = document.getElementById('toggle-open-btn');
    toggleBtn?.addEventListener('click', () => {
      this.toggleIsOpen();
    });

    // Get last report
    const reportBtn = document.getElementById('see-report-btn');
    reportBtn?.addEventListener('click', async () => {
      await this.getLastReport();
    });

    // Clear reports
    const clearBtn = document.getElementById('clear-reports-btn');
    clearBtn?.addEventListener('click', () => {
      this.clearReports();
    });

    // Refresh component
    const refreshBtn = document.getElementById('refresh-component-btn');
    refreshBtn?.addEventListener('click', () => {
      this.refreshComponent();
    });

    // Title editor
    const titleToggleBtn = document.getElementById('toggle-title-editor');
    titleToggleBtn?.addEventListener('click', () => {
      this.toggleTitleEditor();
    });

    const titleApplyBtn = document.getElementById('apply-title');
    titleApplyBtn?.addEventListener('click', () => {
      this.applyTitle();
    });

    const titleInput = document.getElementById('title-input') as HTMLInputElement;
    titleInput?.addEventListener('input', () => {
      this.validateTitle();
    });

    // ToolArgs editor
    const toolArgsToggleBtn = document.getElementById('toggle-toolargs-editor');
    toolArgsToggleBtn?.addEventListener('click', () => {
      this.toggleToolArgsEditor();
    });

    const toolArgsApplyBtn = document.getElementById('apply-toolargs');
    toolArgsApplyBtn?.addEventListener('click', () => {
      this.applyToolArgs();
    });

    const toolArgsEditor = document.getElementById('toolargs-json-editor') as HTMLTextAreaElement;
    toolArgsEditor?.addEventListener('input', () => {
      this.validateToolArgs();
    });

    // Patient Data editor
    const patientDataToggleBtn = document.getElementById('toggle-patientdata-editor');
    patientDataToggleBtn?.addEventListener('click', () => {
      this.togglePatientDataEditor();
    });

    const patientDataApplyBtn = document.getElementById('apply-patientdata');
    patientDataApplyBtn?.addEventListener('click', () => {
      this.applyPatientData();
    });

    const patientDataEditor = document.getElementById('patientdata-json-editor') as HTMLTextAreaElement;
    patientDataEditor?.addEventListener('input', () => {
      this.validatePatientData();
    });

    // Chat Sources editor
    const chatSourcesToggleBtn = document.getElementById('toggle-chatsources-editor');
    chatSourcesToggleBtn?.addEventListener('click', () => {
      this.toggleChatSourcesEditor();
    });

    const chatSourcesApplyBtn = document.getElementById('apply-chatsources');
    chatSourcesApplyBtn?.addEventListener('click', () => {
      this.applyChatSources();
    });

    const chatSourcesInput = document.getElementById('chatsources-input') as HTMLInputElement;
    chatSourcesInput?.addEventListener('input', () => {
      this.validateChatSources();
    });

    // Only chat toggle
    const onlyChatToggle = document.getElementById('only-chat-toggle') as HTMLInputElement;
    onlyChatToggle?.addEventListener('change', () => {
      this.updateOnlyChat();
    });
  }

  private async setupComponent() {
    await customElements.whenDefined('sofia-sdk');

    const container = document.getElementById('sofia-container');
    if (!container) return;

    container.innerHTML = '';
    const component = document.createElement('sofia-sdk') as OmniscribeElement;
    
    // Set attributes
    component.setAttribute('patientid', this.config.patientId);
    component.setAttribute('userid', this.config.userId);
    component.setAttribute('apikey', this.config.apiKey);
    component.setAttribute('baseurl', this.config.baseUrl);
    component.setAttribute('wssurl', this.config.wssUrl);
    component.setAttribute('isopen', this.isOpen.toString());
    component.setAttribute('language', 'es');
    component.setAttribute('title', this.sofiaTitle);
    component.setAttribute('patientdata', JSON.stringify(this.patientData));
    component.setAttribute('toolsargs', JSON.stringify(this.toolsArgs));
    component.setAttribute('onlychat', this.onlyChat.toString());
    component.setAttribute('chatsources', JSON.stringify(this.chatSources));

    // Set up event handlers
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

    container.appendChild(component);
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

    // Update title display
    const titleDisplay = document.getElementById('title-display');
    if (titleDisplay) {
      titleDisplay.textContent = this.sofiaTitle || 'Not set';
    }

    // Update only chat toggle
    const onlyChatToggle = document.getElementById('only-chat-toggle') as HTMLInputElement;
    const onlyChatText = document.getElementById('only-chat-text');
    const onlyChatDescription = document.getElementById('only-chat-description');
    
    if (onlyChatToggle) {
      onlyChatToggle.checked = this.onlyChat;
    }
    if (onlyChatText) {
      onlyChatText.textContent = this.onlyChat ? 'Only Chat Mode: ON' : 'Only Chat Mode: OFF';
    }
    if (onlyChatDescription) {
      onlyChatDescription.textContent = this.onlyChat 
        ? 'Chat interface only, no additional features' 
        : 'Full interface with all features';
    }

    // Update ToolArgs display
    const toolArgsDisplay = document.getElementById('toolargs-display');
    if (toolArgsDisplay) {
      toolArgsDisplay.textContent = JSON.stringify(this.toolsArgs, null, 2);
    }

    // Update tools count
    const toolsCount = document.getElementById('tools-count');
    if (toolsCount) {
      const toolsArray = Array.isArray(this.toolsArgs) ? this.toolsArgs : 
                        (this.toolsArgs && typeof this.toolsArgs === 'object' && 'tools' in this.toolsArgs) ? 
                        (this.toolsArgs as any).tools : [];
      toolsCount.textContent = Array.isArray(toolsArray) ? toolsArray.length.toString() : '0';
    }

    // Update PatientData display
    const patientDataDisplay = document.getElementById('patientdata-display');
    if (patientDataDisplay) {
      patientDataDisplay.textContent = JSON.stringify(this.patientData, null, 2);
    }

    // Update Chat Sources display
    const chatSourcesDisplay = document.getElementById('chatsources-display');
    if (chatSourcesDisplay) {
      chatSourcesDisplay.textContent = this.chatSources.join(', ') || 'Not set';
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
        console.error("Error obteniendo último reporte:", error);
      }
    } else {
      console.warn("No hay función getLastReport registrada ❌");
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

  // Title Editor Methods
  private toggleTitleEditor() {
    this.isEditingTitle = !this.isEditingTitle;
    
    const titlePreview = document.getElementById('title-preview');
    const titleEditor = document.getElementById('title-editor');
    const toggleBtn = document.getElementById('toggle-title-editor');
    const applyBtn = document.getElementById('apply-title');
    
    if (this.isEditingTitle) {
      this.titleString = this.sofiaTitle;
      const titleInput = document.getElementById('title-input') as HTMLInputElement;
      if (titleInput) {
        titleInput.value = this.titleString;
      }
      
      if (titlePreview) titlePreview.style.display = 'none';
      if (titleEditor) titleEditor.style.display = 'block';
      if (toggleBtn) toggleBtn.textContent = 'Cancel Edit';
      if (applyBtn) applyBtn.style.display = 'inline-flex';
    } else {
      if (titlePreview) titlePreview.style.display = 'block';
      if (titleEditor) titleEditor.style.display = 'none';
      if (toggleBtn) toggleBtn.textContent = 'Edit Title';
      if (applyBtn) applyBtn.style.display = 'none';
      this.titleError = '';
      this.updateTitleError();
    }
  }

  private validateTitle() {
    const titleInput = document.getElementById('title-input') as HTMLInputElement;
    if (!titleInput) return;
    
    this.titleString = titleInput.value;
    this.titleError = '';
    
    if (this.titleString.length === 0) {
      this.titleError = 'Title cannot be empty';
    } else if (this.titleString.length > 100) {
      this.titleError = 'Title is too long (max 100 characters)';
    }
    
    this.updateTitleError();
    this.updateApplyButtonState();
  }

  private updateTitleError() {
    const errorElement = document.getElementById('title-error');
    const titleInput = document.getElementById('title-input') as HTMLInputElement;
    
    if (errorElement) {
      if (this.titleError) {
        errorElement.textContent = this.titleError;
        errorElement.style.display = 'block';
      } else {
        errorElement.style.display = 'none';
      }
    }
    
    if (titleInput) {
      titleInput.className = this.titleError ? 'title-input error' : 'title-input';
    }
  }

  private updateApplyButtonState() {
    const applyBtn = document.getElementById('apply-title') as HTMLButtonElement;
    if (applyBtn) {
      applyBtn.disabled = !!this.titleError;
    }
  }

  private applyTitle() {
    if (this.titleError) return;
    
    this.sofiaTitle = this.titleString.trim();
    this.updateComponentTitle();
    this.toggleTitleEditor();
    this.updateUI();
  }

  private updateComponentTitle() {
    if (this.component) {
      this.component.setAttribute('title', this.sofiaTitle);
    } else {
      console.warn('Componente Sofia no encontrado, no se pudo actualizar el título');
    }
  }

  private updateOnlyChat() {
    const onlyChatToggle = document.getElementById('only-chat-toggle') as HTMLInputElement;
    if (onlyChatToggle) {
      this.onlyChat = onlyChatToggle.checked;
    }
    
    if (this.component) {
      this.component.setAttribute('onlychat', this.onlyChat.toString());
    } else {
      console.warn('Componente Sofia no encontrado, no se pudo actualizar onlychat');
    }
    
    this.updateUI();
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

  // ToolArgs Editor Methods
  private toggleToolArgsEditor() {
    this.isEditingToolArgs = !this.isEditingToolArgs;
    
    const toolArgsPreview = document.getElementById('toolargs-preview');
    const toolArgsEditor = document.getElementById('toolargs-editor');
    const toggleBtn = document.getElementById('toggle-toolargs-editor');
    const applyBtn = document.getElementById('apply-toolargs');
    
    if (this.isEditingToolArgs) {
      this.toolArgsString = JSON.stringify(this.toolsArgs, null, 2);
      const toolArgsTextarea = document.getElementById('toolargs-json-editor') as HTMLTextAreaElement;
      if (toolArgsTextarea) {
        toolArgsTextarea.value = this.toolArgsString;
      }
      
      if (toolArgsPreview) toolArgsPreview.style.display = 'none';
      if (toolArgsEditor) toolArgsEditor.style.display = 'block';
      if (toggleBtn) toggleBtn.textContent = 'Cancel Edit';
      if (applyBtn) applyBtn.style.display = 'inline-flex';
    } else {
      if (toolArgsPreview) toolArgsPreview.style.display = 'block';
      if (toolArgsEditor) toolArgsEditor.style.display = 'none';
      if (toggleBtn) toggleBtn.textContent = 'Edit ToolArgs';
      if (applyBtn) applyBtn.style.display = 'none';
      this.toolArgsError = '';
      this.updateToolArgsError();
    }
  }

  private validateToolArgs() {
    const toolArgsTextarea = document.getElementById('toolargs-json-editor') as HTMLTextAreaElement;
    if (!toolArgsTextarea) return;
    
    this.toolArgsString = toolArgsTextarea.value;
    this.toolArgsError = '';
    
    if (this.toolArgsString.trim().length === 0) {
      this.toolArgsError = 'ToolArgs cannot be empty';
    } else {
      try {
        JSON.parse(this.toolArgsString);
      } catch (e) {
        this.toolArgsError = `Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`;
      }
    }
    
    this.updateToolArgsError();
    this.updateToolArgsApplyButtonState();
  }

  private updateToolArgsError() {
    const errorElement = document.getElementById('toolargs-error');
    const toolArgsTextarea = document.getElementById('toolargs-json-editor') as HTMLTextAreaElement;
    
    if (errorElement) {
      if (this.toolArgsError) {
        errorElement.textContent = this.toolArgsError;
        errorElement.style.display = 'block';
      } else {
        errorElement.style.display = 'none';
      }
    }
    
    if (toolArgsTextarea) {
      toolArgsTextarea.className = this.toolArgsError ? 'json-editor error' : 'json-editor';
    }
  }

  private updateToolArgsApplyButtonState() {
    const applyBtn = document.getElementById('apply-toolargs') as HTMLButtonElement;
    if (applyBtn) {
      applyBtn.disabled = !!this.toolArgsError;
    }
  }

  private applyToolArgs() {
    if (this.toolArgsError) return;
    
    try {
      this.toolsArgs = JSON.parse(this.toolArgsString);
      this.updateComponentToolArgs();
      this.toggleToolArgsEditor();
      this.updateUI();
    } catch (e) {
      console.error('Error aplicando ToolArgs:', e);
    }
  }

  private updateComponentToolArgs() {
    if (this.component) {
      this.component.setAttribute('toolsargs', JSON.stringify(this.toolsArgs));
    } else {
      console.warn('Componente Sofia no encontrado, no se pudo actualizar toolsargs');
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
      console.error('Error aplicando Patient Data:', e);
    }
  }

  private updateComponentPatientData() {
    if (this.component) {
      this.component.setAttribute('patientdata', JSON.stringify(this.patientData));
    } else {
      console.warn('Componente Sofia no encontrado, no se pudo actualizar patientdata');
    }
  }

  // Chat Sources Editor Methods
  private toggleChatSourcesEditor() {
    this.isEditingChatSources = !this.isEditingChatSources;
    
    const chatSourcesPreview = document.getElementById('chatsources-preview');
    const chatSourcesEditor = document.getElementById('chatsources-editor');
    const toggleBtn = document.getElementById('toggle-chatsources-editor');
    const applyBtn = document.getElementById('apply-chatsources');
    
    if (this.isEditingChatSources) {
      this.chatSourcesString = this.chatSources.join(', ');
      const chatSourcesInput = document.getElementById('chatsources-input') as HTMLInputElement;
      if (chatSourcesInput) {
        chatSourcesInput.value = this.chatSourcesString;
      }
      
      if (chatSourcesPreview) chatSourcesPreview.style.display = 'none';
      if (chatSourcesEditor) chatSourcesEditor.style.display = 'block';
      if (toggleBtn) toggleBtn.textContent = 'Cancel Edit';
      if (applyBtn) applyBtn.style.display = 'inline-flex';
    } else {
      if (chatSourcesPreview) chatSourcesPreview.style.display = 'block';
      if (chatSourcesEditor) chatSourcesEditor.style.display = 'none';
      if (toggleBtn) toggleBtn.textContent = 'Edit Chat Sources';
      if (applyBtn) applyBtn.style.display = 'none';
      this.chatSourcesError = '';
      this.updateChatSourcesError();
    }
  }

  private validateChatSources() {
    const chatSourcesInput = document.getElementById('chatsources-input') as HTMLInputElement;
    if (!chatSourcesInput) return;
    
    this.chatSourcesString = chatSourcesInput.value;
    this.chatSourcesError = '';
    
    if (this.chatSourcesString.length > 500) {
      this.chatSourcesError = 'Chat sources is too long (max 500 characters)';
    }
    
    this.updateChatSourcesError();
    this.updateChatSourcesApplyButtonState();
  }

  private updateChatSourcesError() {
    const errorElement = document.getElementById('chatsources-error');
    const chatSourcesInput = document.getElementById('chatsources-input') as HTMLInputElement;
    
    if (errorElement) {
      if (this.chatSourcesError) {
        errorElement.textContent = this.chatSourcesError;
        errorElement.style.display = 'block';
      } else {
        errorElement.style.display = 'none';
      }
    }
    
    if (chatSourcesInput) {
      chatSourcesInput.className = this.chatSourcesError ? 'chat-sources-input error' : 'chat-sources-input';
    }
  }

  private updateChatSourcesApplyButtonState() {
    const applyBtn = document.getElementById('apply-chatsources') as HTMLButtonElement;
    if (applyBtn) {
      applyBtn.disabled = !!this.chatSourcesError;
    }
  }

  private applyChatSources() {
    if (this.chatSourcesError) return;
    
    this.chatSources = this.chatSourcesString.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.updateComponentChatSources();
    this.toggleChatSourcesEditor();
    this.updateUI();
  }

  private updateComponentChatSources() {
    if (this.component) {
      this.component.setAttribute('chatsources', JSON.stringify(this.chatSources));
    } else {
      console.warn('Componente Sofia no encontrado, no se pudo actualizar chatsources');
    }
  }

  // Public getters for debugging
  public getLastReportData(): unknown {
    return this.lastReportData;
  }

  public getReports(): any[] {
    return this.reports;
  }

  public getComponentState() {
    return {
      isOpen: this.isOpen,
      componentInitialized: this.componentInitialized,
      hasReportHandler: !!this.getLastReportFn,
      reportCount: this.reports.length,
      sofiaTitle: this.sofiaTitle,
      onlyChat: this.onlyChat
    };
  }
}

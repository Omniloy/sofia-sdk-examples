import { useCallback, useState } from 'react';
import { DEFAULT_PATIENT_DATA, TEMPLATE_CONFIG } from './utils/config.ts';
import { LanguageCode, Omniscribe } from '@omniloy/sofia-sdk/react';
import '@omniloy/sofia-sdk/react/index.css';

const config = {
  baseUrl: import.meta.env.VITE_BASE_URL,
  wssUrl: import.meta.env.VITE_WSS_URL,
  apiKey: import.meta.env.VITE_API_KEY,
};

function App() {
  // SDK state
  const [isOpen, setIsOpen] = useState(import.meta.env.VITE_IS_OPEN !== 'false');
  const [reports, setReports] = useState<unknown[]>([]);
  const [lastReportData, setLastReportData] = useState<unknown>(null);
  const [retrievedReportData, setRetrievedReportData] = useState<unknown>(null);
  const [getLastReportFn, setGetLastReportFn] = useState<(() => Promise<unknown>) | null>(null);

  // Configuration
  const [debug, setDebug] = useState(import.meta.env.VITE_DEBUG === 'true');
  const [template, setTemplate] = useState({ ...TEMPLATE_CONFIG });
  const [patientData, setPatientData] = useState({ ...DEFAULT_PATIENT_DATA });
  const [templateId, setTemplateId] = useState('100-sofia-sdk-react-template');
  const [userId, setUserId] = useState('react-test-user');
  const [patientId, setPatientId] = useState('react-test-patient');

  // Template editor
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateString, setTemplateString] = useState('');
  const [templateError, setTemplateError] = useState('');

  // Template ID editor
  const [templateIdInput, setTemplateIdInput] = useState('');

  // User ID / Patient ID editors
  const [userIdInput, setUserIdInput] = useState(userId);
  const [patientIdInput, setPatientIdInput] = useState(patientId);

  // Patient data editor
  const [isEditingPatientData, setIsEditingPatientData] = useState(false);
  const [patientDataString, setPatientDataString] = useState('');
  const [patientDataError, setPatientDataError] = useState('');

  // ===== SDK Callbacks =====

  const handleReport = useCallback((report: unknown) => {
    setLastReportData(report);
    setReports((prev) => [...prev, report]);
  }, []);

  const handleSetGetLastReport = useCallback((fn: () => Promise<unknown>) => {
    setGetLastReportFn(() => fn);
  }, []);

  // Get last report
  const handleGetLastReport = async () => {
    if (getLastReportFn) {
      try {
        const report = await getLastReportFn();
        setRetrievedReportData(report);
      } catch (error) {
        console.error('Error getting last report:', error);
      }
    }
  };

  // Template editor
  const handleToggleTemplateEditor = () => {
    if (!isEditingTemplate) {
      setTemplateString(JSON.stringify(template, null, 2));
      setTemplateError('');
    }
    setIsEditingTemplate((prev) => !prev);
  };

  const handleTemplateChange = (value: string) => {
    setTemplateString(value);
    if (value.trim().length === 0) {
      setTemplateError('Template cannot be empty');
    } else {
      try {
        JSON.parse(value);
        setTemplateError('');
      } catch (e) {
        setTemplateError(`Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
  };

  const handleApplyTemplate = () => {
    if (templateError) return;
    try {
      setTemplate(JSON.parse(templateString));
      setIsEditingTemplate(false);
    } catch (e) {
      console.error('Error applying template:', e);
    }
  };

  // Template ID
  const handleApplyTemplateId = () => {
    if (templateIdInput.trim()) {
      setTemplateId(templateIdInput.trim());
    }
  };

  // Patient data editor
  const handleTogglePatientDataEditor = () => {
    if (!isEditingPatientData) {
      setPatientDataString(JSON.stringify(patientData, null, 2));
      setPatientDataError('');
    }
    setIsEditingPatientData((prev) => !prev);
  };

  const handlePatientDataChange = (value: string) => {
    setPatientDataString(value);
    if (value.trim().length === 0) {
      setPatientDataError('Patient Data cannot be empty');
    } else {
      try {
        JSON.parse(value);
        setPatientDataError('');
      } catch (e) {
        setPatientDataError(`Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
  };

  const handleApplyPatientData = () => {
    if (patientDataError) return;
    try {
      setPatientData(JSON.parse(patientDataString));
      setIsEditingPatientData(false);
    } catch (e) {
      console.error('Error applying patient data:', e);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-logo">
            <img src="/assets/logo.svg" alt="Omniloy" className="omniloy-logo" />
          </div>
          <div className="header-text">
            <h1>SofIA SDK - React</h1>
            <p>
              Live development environment with dynamic configuration, real-time debugging tools,
              and complete SDK integration patterns.{' '}
              <a href="https://omniloy.mintlify.app/en" target="_blank" rel="noopener noreferrer">
                View docs
              </a>
            </p>
          </div>
        </div>
      </header>

      {/* Sofia Component — rendered declaratively via JSX */}
      <div className="sofia-wrapper">
        <Omniscribe
          baseurl={config.baseUrl}
          wssurl={config.wssUrl}
          apikey={config.apiKey}
          userid={userId}
          patientid={patientId}
          templateid={templateId}
          template={template}
          patientdata={patientData}
          isopen={isOpen}
          setIsOpen={setIsOpen}
          handleReport={handleReport}
          setGetLastReport={handleSetGetLastReport}
          debug={debug ?? undefined}
          language={LanguageCode.es}
        />
      </div>

      {/* Debug Controls */}
      <div className="debug-section">
        <div className="section-header">
          <h2>SDK Development Console</h2>
        </div>
        <div className="debug-panel">
          {/* SDK Runtime Controls */}
          <div className="control-group">
            <h3>SDK Runtime Controls</h3>
            <div className="controls">
              <button className="btn btn-primary" onClick={() => setIsOpen((prev) => !prev)}>
                {isOpen ? 'Close Sofia SDK' : 'Open Sofia SDK'}
              </button>
              <button
                className="btn btn-secondary"
                disabled={!getLastReportFn}
                onClick={handleGetLastReport}
              >
                Get Last Report
              </button>
            </div>
          </div>

          {/* SDK State Monitor */}
          <div className="control-group">
            <h3>SDK State Monitor</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">SDK State:</span>
                <span className={`status-value ${isOpen ? 'success' : 'neutral'}`}>
                  {isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Report Handler:</span>
                <span className={`status-value ${getLastReportFn ? 'success' : 'error'}`}>
                  {getLastReportFn ? 'Registered' : 'Not Available'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Event Count:</span>
                <span className="status-value neutral">{reports.length}</span>
              </div>
            </div>
          </div>

          {/* Template Configuration */}
          <div className="control-group">
            <div className="tools-args-header">
              <h3>Template Configuration</h3>
              <div className="tools-args-controls">
                <button className="btn btn-outline" onClick={handleToggleTemplateEditor}>
                  {isEditingTemplate ? 'Cancel Edit' : 'Edit Template'}
                </button>
                {isEditingTemplate && (
                  <button
                    className="btn btn-primary"
                    disabled={!!templateError}
                    onClick={handleApplyTemplate}
                  >
                    Apply Changes
                  </button>
                )}
              </div>
            </div>

            {!isEditingTemplate && (
              <div className="tools-args-section">
                <div className="tools-args-preview">
                  <h4>Current Template:</h4>
                  <pre className="json-display">{JSON.stringify(template, null, 2)}</pre>
                </div>
              </div>
            )}

            {isEditingTemplate && (
              <div className="tools-args-editor">
                <div className="editor-header">
                  <h4>Edit Template JSON:</h4>
                </div>
                <textarea
                  className={`json-editor ${templateError ? 'error' : ''}`}
                  value={templateString}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  placeholder="Enter valid JSON for template configuration..."
                />
                {templateError && <div className="error-message">{templateError}</div>}
                <div className="editor-footer">
                  <small className="editor-hint">
                    Define the JSON Schema template for report generation (valid JSON required)
                  </small>
                </div>
              </div>
            )}
          </div>

          {/* Template ID */}
          <div className="control-group">
            <div className="tools-args-header">
              <h3>Template ID</h3>
              <div className="tools-args-controls">
                <button className="btn btn-primary" onClick={handleApplyTemplateId}>
                  Apply
                </button>
              </div>
            </div>
            <div className="templateid-section">
              <div className="templateid-preview">
                <span className="status-label">Current Template ID:</span>
                <span className="status-value neutral">{templateId || 'Not set'}</span>
              </div>
              <div className="templateid-editor">
                <input
                  type="text"
                  className="title-input"
                  value={templateIdInput}
                  onChange={(e) => setTemplateIdInput(e.target.value)}
                  placeholder="Enter template ID..."
                />
              </div>
            </div>
          </div>

          {/* User ID */}
          <div className="control-group">
            <div className="tools-args-header">
              <h3>User ID</h3>
              <div className="tools-args-controls">
                <button className="btn btn-primary" onClick={() => { if (userIdInput.trim()) setUserId(userIdInput.trim()); }}>
                  Apply
                </button>
              </div>
            </div>
            <div className="templateid-section">
              <div className="templateid-preview">
                <span className="status-label">Current User ID:</span>
                <span className="status-value neutral">{userId || 'Not set'}</span>
              </div>
              <div className="templateid-editor">
                <input
                  type="text"
                  className="title-input"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  placeholder="Enter user ID..."
                />
              </div>
            </div>
          </div>

          {/* Patient ID */}
          <div className="control-group">
            <div className="tools-args-header">
              <h3>Patient ID</h3>
              <div className="tools-args-controls">
                <button className="btn btn-primary" onClick={() => { if (patientIdInput.trim()) setPatientId(patientIdInput.trim()); }}>
                  Apply
                </button>
              </div>
            </div>
            <div className="templateid-section">
              <div className="templateid-preview">
                <span className="status-label">Current Patient ID:</span>
                <span className="status-value neutral">{patientId || 'Not set'}</span>
              </div>
              <div className="templateid-editor">
                <input
                  type="text"
                  className="title-input"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  placeholder="Enter patient ID..."
                />
              </div>
            </div>
          </div>

          {/* Debug Toggle */}
          <div className="control-group">
            <div className="config-header">
              <h3>Debug Mode</h3>
            </div>
            <div className="config-section">
              <div className="toggle-control">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    className="toggle-checkbox"
                    checked={debug}
                    onChange={() => setDebug((prev) => !prev)}
                  />
                  <span className="toggle-text">Debug Mode: {debug ? 'ON' : 'OFF'}</span>
                </label>
                <div className="toggle-description">
                  Enable debug logging in the SDK console output
                </div>
              </div>
            </div>
          </div>

          {/* Patient Data Configuration */}
          <div className="control-group">
            <div className="patient-data-header">
              <h3>Patient Data Configuration</h3>
              <div className="patient-data-controls">
                <button className="btn btn-outline" onClick={handleTogglePatientDataEditor}>
                  {isEditingPatientData ? 'Cancel Edit' : 'Edit Patient Data'}
                </button>
                {isEditingPatientData && (
                  <button
                    className="btn btn-primary"
                    disabled={!!patientDataError}
                    onClick={handleApplyPatientData}
                  >
                    Apply Changes
                  </button>
                )}
              </div>
            </div>

            {!isEditingPatientData && (
              <div className="patient-data-section">
                <div className="patient-data-preview">
                  <h4>Current Patient Data:</h4>
                  <pre className="json-display">{JSON.stringify(patientData, null, 2)}</pre>
                </div>
              </div>
            )}

            {isEditingPatientData && (
              <div className="patient-data-editor">
                <div className="editor-section">
                  <h4>Edit Patient Data JSON:</h4>
                  <textarea
                    className={`json-editor ${patientDataError ? 'error' : ''}`}
                    value={patientDataString}
                    onChange={(e) => handlePatientDataChange(e.target.value)}
                    placeholder="Enter valid JSON for patient data..."
                  />
                  {patientDataError && <div className="error-message">{patientDataError}</div>}
                  <div className="editor-footer">
                    <small className="editor-hint">
                      Define patient information for the Sofia SDK (valid JSON required)
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Report Data */}
          {(lastReportData !== null || retrievedReportData !== null) && (
            <div className="control-group">
              <h3>Report Data</h3>

              {lastReportData !== null && (
                <div className="data-section">
                  <h4>Last Received Report:</h4>
                  <pre className="json-display">{JSON.stringify(lastReportData, null, 2)}</pre>
                </div>
              )}

              {retrievedReportData !== null && (
                <div className="data-section">
                  <h4>Retrieved Report:</h4>
                  <pre className="json-display">
                    {JSON.stringify(retrievedReportData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

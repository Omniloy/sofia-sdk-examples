angular.module('myApp').controller('MainController', [
  '$scope', 
  '$http', 
  '$timeout', 
  function($scope, $http, $timeout) {
    const DEFAULT_CONFIG = {
      patientId: '12345',
      userId: 'user123',
      baseUrl: 'https://api.example.com',
      wssUrl: 'https://api.example.com',
      apiKey: 'demo-key',
      isOpen: true
    };

    const DEFAULT_PATIENT_DATA = {
      extraData: { enfermedad: 'es celiaco y diabético' },
      fullName: 'John Doe',
      birthDate: '01/15/1980',
      phone: '555-123-4567',
      address: '123 Main St, Example City'
    };

    const DEFAULT_CHAT_SOURCES = [
      'Guías Clínicas',
      'Base de Datos de Medicamentos',
      'Estudios Científicos',
      'Base de Datos EMA',
      'Guías OMS',
      'Guías NICE',
      'Base de Datos FDA'
    ];

    // Initialize scope variables
    $scope.componentInitialized = false;
    $scope.getLastReportFn = null;
    $scope.reports = [];

    // Configuration with defaults
    $scope.patientId = '12345';
    $scope.userId = 'user123';
    $scope.baseUrl = 'https://api.example.com';
    $scope.wssUrl = 'https://api.example.com';
    $scope.apiKey = 'demo-key';
    $scope.isOpen = true;
    $scope.sofiaTitle = 'Sofia Assistant';
    $scope.onlyChat = false;
    $scope.toolsArgsObject = window.ToolArgs || {};
    $scope.patientData = DEFAULT_PATIENT_DATA;
    $scope.chatSources = DEFAULT_CHAT_SOURCES;

    // Editor states
    $scope.isEditingTitle = false;
    $scope.isEditingToolArgs = false;
    $scope.isEditingPatientData = false;
    $scope.isEditingChatSources = false;

    // Editor values
    $scope.titleInput = $scope.sofiaTitle;
    $scope.toolArgsString = JSON.stringify($scope.toolsArgsObject, null, 2);
    $scope.patientDataString = JSON.stringify($scope.patientData, null, 2);
    $scope.chatSourcesString = $scope.chatSources.join(', ');

    // Error states
    $scope.toolArgsError = '';
    $scope.patientDataError = '';
    $scope.chatSourcesError = '';

    // Computed properties for component binding
    $scope.toolsArgs = JSON.stringify($scope.toolsArgsObject);
    $scope.patientDataJson = JSON.stringify($scope.patientData);
    $scope.chatSourcesJson = JSON.stringify($scope.chatSources);

    /**
     * Handle reports from the component
     * @param {Object} report - The report object from the component
     */
    $scope.handleReport = function(report) {
      $scope.$apply(function() {
        $scope.lastReport = report;
        $scope.reports.push(report);
      });
    };

    /**
     * Set the isOpen state with flexible input handling
     * @param {boolean|function} isOpenOrToggleFunction - State or toggle function
     */
    $scope.setIsOpen = function(isOpenOrToggleFunction) {
      let newIsOpen;
      
      if (typeof isOpenOrToggleFunction === 'function') {
        try {
          newIsOpen = !!isOpenOrToggleFunction($scope.isOpen);
        } catch (err) {
          newIsOpen = !$scope.isOpen;
          console.warn('Error calling toggle function, defaulting to toggle:', err);
        }
      } else {
        newIsOpen = !!isOpenOrToggleFunction;
      }
      
      if ($scope.isOpen !== newIsOpen) {
        $scope.$apply(function() {
          $scope.isOpen = newIsOpen;
        });
      }
    };

    /**
     * Set the getLastReport callback function
     * @param {function} fn - Function that returns the last report
     */
    $scope.setGetLastReport = function(fn) {
      if (typeof fn === 'function') {
        $scope.getLastReportFn = function() {
          fn().then(function(report) {
            $scope.$apply(function() {
              $scope.retrievedReport = report;
            });
          }).catch(function(error) {
            console.error('Error:', error);
            $scope.$apply(function() {
              $scope.retrievedReport = { error: error.message };
            });
          });
        };
      }
    };

    // =============================================================================
    // COMPONENT CONTROL METHODS
    // =============================================================================

    /**
     * Toggle the isOpen state
     */
    $scope.toggleIsOpen = function() {
      $scope.isOpen = !$scope.isOpen;
      $scope.updateComponentIsOpen();
    };

    /**
     * Get the last report from the component
     */
    $scope.getLastReport = function() {
      if ($scope.getLastReportFn) {
        $scope.retrievedReport = 'Loading...';
        $scope.getLastReportFn();
      }
    };

    /**
     * Clear all reports
     */
    $scope.clearReports = function() {
      $scope.reports = [];
      $scope.lastReport = null;
      $scope.retrievedReport = null;
    };

    /**
     * Refresh the component
     */
    $scope.refreshComponent = function() {
      $scope.componentInitialized = false;
      $timeout(function() {
        $scope.setupComponentWithRetry(3, 500);
      }, 100);
    };

    // =============================================================================
    // TITLE EDITOR METHODS
    // =============================================================================

    /**
     * Toggle title editor
     */
    $scope.toggleTitleEditor = function() {
      if ($scope.isEditingTitle) {
        $scope.titleInput = $scope.sofiaTitle; // Reset on cancel
      } else {
        $scope.titleInput = $scope.sofiaTitle; // Initialize with current value
      }
      $scope.isEditingTitle = !$scope.isEditingTitle;
    };

    /**
     * Apply title changes
     */
    $scope.applyTitle = function() {
      $scope.sofiaTitle = $scope.titleInput;
      $scope.updateComponentTitle();
      $scope.isEditingTitle = false;
    };

    /**
     * Update component title attribute
     */
    $scope.updateComponentTitle = function() {
      const component = document.getElementById('sofia-component');
      if (component) {
        component.setAttribute('title', $scope.sofiaTitle);
      }
    };

    // =============================================================================
    // ONLYCHAT TOGGLE METHODS
    // =============================================================================

    /**
     * Update onlyChat setting
     */
    $scope.updateOnlyChat = function() {
      const component = document.getElementById('sofia-component');
      if (component) {
        component.setAttribute('onlychat', $scope.onlyChat.toString());
      }
    };

    // =============================================================================
    // TOOLARGS EDITOR METHODS
    // =============================================================================

    /**
     * Toggle ToolArgs editor
     */
    $scope.toggleToolArgsEditor = function() {
      if ($scope.isEditingToolArgs) {
        $scope.toolArgsString = JSON.stringify($scope.toolsArgsObject, null, 2); // Reset on cancel
        $scope.toolArgsError = '';
      } else {
        $scope.toolArgsString = JSON.stringify($scope.toolsArgsObject, null, 2); // Initialize
      }
      $scope.isEditingToolArgs = !$scope.isEditingToolArgs;
    };

    /**
     * Validate ToolArgs JSON
     */
    $scope.validateToolArgs = function() {
      try {
        JSON.parse($scope.toolArgsString);
        $scope.toolArgsError = '';
      } catch (e) {
        $scope.toolArgsError = 'Invalid JSON: ' + e.message;
      }
    };

    /**
     * Apply ToolArgs changes
     */
    $scope.applyToolArgs = function() {
      if ($scope.toolArgsError) return;
      
      try {
        $scope.toolsArgsObject = JSON.parse($scope.toolArgsString);
        $scope.toolsArgs = JSON.stringify($scope.toolsArgsObject); // For component binding
        $scope.updateComponentToolArgs();
        $scope.isEditingToolArgs = false;
      } catch (e) {
        $scope.toolArgsError = 'Error applying ToolArgs: ' + e.message;
      }
    };

    /**
     * Update component toolArgs attribute
     */
    $scope.updateComponentToolArgs = function() {
      const component = document.getElementById('sofia-component');
      if (component) {
        component.setAttribute('toolsargs', $scope.toolsArgs);
      }
    };

    // =============================================================================
    // PATIENT DATA EDITOR METHODS
    // =============================================================================

    /**
     * Toggle Patient Data editor
     */
    $scope.togglePatientDataEditor = function() {
      if ($scope.isEditingPatientData) {
        $scope.patientDataString = JSON.stringify($scope.patientData, null, 2); // Reset on cancel
        $scope.patientDataError = '';
      } else {
        $scope.patientDataString = JSON.stringify($scope.patientData, null, 2); // Initialize
      }
      $scope.isEditingPatientData = !$scope.isEditingPatientData;
    };

    /**
     * Validate Patient Data JSON
     */
    $scope.validatePatientData = function() {
      try {
        JSON.parse($scope.patientDataString);
        $scope.patientDataError = '';
      } catch (e) {
        $scope.patientDataError = 'Invalid JSON: ' + e.message;
      }
    };

    /**
     * Apply Patient Data changes
     */
    $scope.applyPatientData = function() {
      if ($scope.patientDataError) return;
      
      try {
        $scope.patientData = JSON.parse($scope.patientDataString);
        $scope.patientDataJson = JSON.stringify($scope.patientData); // For component binding
        $scope.updateComponentPatientData();
        $scope.isEditingPatientData = false;
      } catch (e) {
        $scope.patientDataError = 'Error applying Patient Data: ' + e.message;
      }
    };

    /**
     * Update component patientData attribute
     */
    $scope.updateComponentPatientData = function() {
      const component = document.getElementById('sofia-component');
      if (component) {
        component.setAttribute('patientdata', $scope.patientDataJson);
      }
    };

    // =============================================================================
    // CHAT SOURCES EDITOR METHODS
    // =============================================================================

    /**
     * Toggle Chat Sources editor
     */
    $scope.toggleChatSourcesEditor = function() {
      if ($scope.isEditingChatSources) {
        $scope.chatSourcesString = $scope.chatSources.join(', '); // Reset on cancel
        $scope.chatSourcesError = '';
      } else {
        $scope.chatSourcesString = $scope.chatSources.join(', '); // Initialize
      }
      $scope.isEditingChatSources = !$scope.isEditingChatSources;
    };

    /**
     * Validate Chat Sources
     */
    $scope.validateChatSources = function() {
      if (!$scope.chatSourcesString.trim()) {
        $scope.chatSourcesError = 'Chat sources cannot be empty';
        return;
      }
      
      const sources = $scope.chatSourcesString.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (sources.length === 0) {
        $scope.chatSourcesError = 'At least one valid chat source is required';
      } else {
        $scope.chatSourcesError = '';
      }
    };

    /**
     * Apply Chat Sources changes
     */
    $scope.applyChatSources = function() {
      if ($scope.chatSourcesError) return;
      
      $scope.chatSources = $scope.chatSourcesString.split(',').map(s => s.trim()).filter(s => s.length > 0);
      $scope.chatSourcesJson = JSON.stringify($scope.chatSources); // For component binding
      $scope.updateComponentChatSources();
      $scope.isEditingChatSources = false;
    };

    /**
     * Update component chatSources attribute
     */
    $scope.updateComponentChatSources = function() {
      const component = document.getElementById('sofia-component');
      if (component) {
        component.setAttribute('chatsources', $scope.chatSourcesJson);
      }
    };

    // =============================================================================
    // COMPONENT INITIALIZATION
    // =============================================================================

    /**
     * Initialize environment configuration
     * @param {Object} config - Configuration object
     */
    $scope.initializeEnvironment = function(config) {
      const mergedConfig = { ...DEFAULT_CONFIG, ...config };
      
      $scope.patientId = mergedConfig.patientId;
      $scope.userId = mergedConfig.userId;
      $scope.baseUrl = mergedConfig.baseUrl;
      $scope.wssUrl = mergedConfig.wssUrl;
      $scope.apiKey = mergedConfig.apiKey;
      $scope.isOpen = mergedConfig.isOpen;
      
      if (config.patientData) {
        $scope.patientData = { ...DEFAULT_PATIENT_DATA, ...config.patientData };
        $scope.patientDataJson = JSON.stringify($scope.patientData);
        $scope.patientDataString = JSON.stringify($scope.patientData, null, 2);
      }
      
      $scope.setupComponentWithRetry(3, 500);
    };

    /**
     * Attempt to set up component with retry mechanism
     * @param {number} maxAttempts - Maximum number of setup attempts
     * @param {number} baseDelay - Base delay between attempts
     */
    $scope.setupComponentWithRetry = function(maxAttempts, baseDelay) {
      let attempts = 0;
      
      function trySetup() {
        attempts++;
        const component = document.getElementById('sofia-component');
        
        if (component) {
          setupSofIAComponent(component);
          return;
        }
        
        if (attempts < maxAttempts) {
          $timeout(trySetup, baseDelay * attempts);
        } else {
          console.error('Failed to initialize SofIA component after ' + maxAttempts + ' attempts');
        }
      }
      
      trySetup();
    };

    /**
     * Set up SofIA component with all attributes and handlers
     * @param {HTMLElement} component - The SofIA component element
     */
    function setupSofIAComponent(component) {
      if ($scope.componentInitialized) return;
      
      // Set all basic attributes
      component.setAttribute('patientid', $scope.patientId);
      component.setAttribute('userid', $scope.userId);
      component.setAttribute('apikey', $scope.apiKey);
      component.setAttribute('baseurl', $scope.baseUrl);
      component.setAttribute('wssurl', $scope.wssUrl);
      component.setAttribute('isopen', $scope.isOpen ? 'true' : 'false');
      component.setAttribute('title', $scope.sofiaTitle);
      component.setAttribute('onlychat', $scope.onlyChat.toString());
      component.setAttribute('language', 'es');
      
      // Set JSON attributes only if they are valid
      try {
        if ($scope.toolsArgsObject && Object.keys($scope.toolsArgsObject).length > 0) {
          component.setAttribute('toolsargs', JSON.stringify($scope.toolsArgsObject));
        }
      } catch (e) {
        console.warn('Error setting toolsargs:', e);
      }
      
      try {
        if ($scope.patientData) {
          component.setAttribute('patientdata', JSON.stringify($scope.patientData));
        }
      } catch (e) {
        console.warn('Error setting patientdata:', e);
      }
      
      try {
        if ($scope.chatSources && $scope.chatSources.length > 0) {
          component.setAttribute('chatsources', JSON.stringify($scope.chatSources));
        }
      } catch (e) {
        console.warn('Error setting chatsources:', e);
      }
      
      // Set direct function properties
      component.handleReport = $scope.handleReport;
      component.setIsOpen = function(isOpenOrToggleFunction) {
        $scope.setIsOpen(isOpenOrToggleFunction);
        $timeout(function() {
          component.setAttribute('isopen', $scope.isOpen ? 'true' : 'false');
        }, 0);
      };
      component.setGetLastReport = function(fn) {
        $scope.setGetLastReport(fn);
      };
      
      // Set kebab-case attributes as fallback
      component.setAttribute('handle-report', 'omniscribeHandleReport');
      component.setAttribute('set-is-open', 'omniscribeSetIsOpen');
      component.setAttribute('set-get-last-report', 'omniscribeSetGetLastReport');
      
      // Add event listeners
      component.addEventListener('handle-report', function(event) {
        $scope.handleReport(event.detail);
      });
      
      component.addEventListener('set-is-open', function(event) {
        $scope.setIsOpen(event.detail);
      });

      component.addEventListener('set-get-last-report', function(event) {
        $scope.setGetLastReport(event.detail);
      });
      
      $scope.componentInitialized = true;
    }
    
    // Set up global functions
    window.omniscribeHandleReport = $scope.handleReport;
    window.omniscribeSetGetLastReport = $scope.setGetLastReport;
    
    // Load environment configuration
    $http.get('assets/environment.json')
      .then(function(response) {
        const environment = response.data;
        $scope.initializeEnvironment(environment);
      })
      .catch(function(error) {
        console.error('Error loading environment:', error);
        $scope.initializeEnvironment({});
      });
  }
]);
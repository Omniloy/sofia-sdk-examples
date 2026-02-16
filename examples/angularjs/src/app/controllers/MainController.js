angular.module('myApp').controller('MainController', [
  '$scope',
  '$http',
  '$timeout',
  function($scope, $http, $timeout) {

    const DEFAULT_PATIENT_DATA = {
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

    // Initialize scope variables
    $scope.componentInitialized = false;
    $scope.getLastReportFn = null;
    $scope.reports = [];
    var eventListeners = [];

    // Configuration with defaults
    $scope.debug = false;
    $scope.templateObject = window.Template || {};
    $scope.patientData = DEFAULT_PATIENT_DATA;

    // Editor states
    $scope.isEditingTemplate = false;
    $scope.isEditingPatientData = false;

    // Editor values
    $scope.templateString = JSON.stringify($scope.templateObject, null, 2);
    $scope.patientDataString = JSON.stringify($scope.patientData, null, 2);

    // Error states
    $scope.templateError = '';
    $scope.patientDataError = '';

    // Computed properties for component binding
    $scope.templateJson = JSON.stringify($scope.templateObject);
    $scope.patientDataJson = JSON.stringify($scope.patientData);

    /**
     * Handle reports from the component
     * @param {Object} report - The report object from the component
     */
    $scope.handleReport = function(report) {
      $scope.$evalAsync(function() {
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
          if ($scope.debug) console.warn('Error calling toggle function, defaulting to toggle:', err);
        }
      } else {
        newIsOpen = !!isOpenOrToggleFunction;
      }

      if ($scope.isOpen !== newIsOpen) {
        $scope.$evalAsync(function() {
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
            $scope.$evalAsync(function() {
              $scope.retrievedReport = report;
            });
          }).catch(function(error) {
            if ($scope.debug) console.error('Error:', error);
            $scope.$evalAsync(function() {
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
      var component = document.getElementById('sofia-component');
      if (component) {
        component.setAttribute('isopen', $scope.isOpen ? 'true' : 'false');
        if (typeof component.setIsOpen === 'function') {
          component.setIsOpen($scope.isOpen);
        }
      }
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
      // Remove previous event listeners to prevent leaks
      eventListeners.forEach(function(entry) {
        entry.element.removeEventListener(entry.event, entry.handler);
      });
      eventListeners = [];
      $scope.componentInitialized = false;
      $timeout(function() {
        $scope.setupComponentWithRetry(3, 500);
      }, 100);
    };

    // =============================================================================
    // DEBUG TOGGLE METHOD
    // =============================================================================

    /**
     * Update debug setting on the component
     */
    $scope.updateDebug = function() {
      const component = document.getElementById('sofia-component');
      if (component) {
        if ($scope.debug) {
          component.setAttribute('debug', 'true');
        } else {
          component.removeAttribute('debug');
        }
      }
    };

    // =============================================================================
    // TEMPLATE ID METHOD
    // =============================================================================

    /**
     * Apply template ID changes to the component
     */
    $scope.applyTemplateId = function() {
      const component = document.getElementById('sofia-component');
      if (component && $scope.templateId) {
        component.setAttribute('templateid', $scope.templateId);
      }
    };

    // =============================================================================
    // TEMPLATE EDITOR METHODS
    // =============================================================================

    /**
     * Toggle Template editor
     */
    $scope.toggleTemplateEditor = function() {
      if ($scope.isEditingTemplate) {
        $scope.templateString = JSON.stringify($scope.templateObject, null, 2); // Reset on cancel
        $scope.templateError = '';
      } else {
        $scope.templateString = JSON.stringify($scope.templateObject, null, 2); // Initialize
      }
      $scope.isEditingTemplate = !$scope.isEditingTemplate;
    };

    /**
     * Validate Template JSON
     */
    $scope.validateTemplate = function() {
      try {
        JSON.parse($scope.templateString);
        $scope.templateError = '';
      } catch (e) {
        $scope.templateError = 'Invalid JSON: ' + e.message;
      }
    };

    /**
     * Apply Template changes
     */
    $scope.applyTemplate = function() {
      if ($scope.templateError) return;

      try {
        $scope.templateObject = JSON.parse($scope.templateString);
        $scope.templateJson = JSON.stringify($scope.templateObject); // For component binding
        $scope.updateComponentTemplate();
        $scope.isEditingTemplate = false;
      } catch (e) {
        $scope.templateError = 'Error applying Template: ' + e.message;
      }
    };

    /**
     * Update component template attribute
     */
    $scope.updateComponentTemplate = function() {
      const component = document.getElementById('sofia-component');
      if (component) {
        component.setAttribute('template', $scope.templateJson);
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
    // COMPONENT INITIALIZATION
    // =============================================================================

    /**
     * Validate that credentials are not placeholder values
     * @param {Object} config - Configuration object
     * @returns {boolean} true if configuration is valid
     */
    $scope.validateConfig = function(config) {
      var placeholders = ['YOUR_BASE_URL', 'YOUR_WSS_URL', 'YOUR_API_KEY', 'YOUR_DEFAULT_USER_ID', 'YOUR_DEFAULT_PATIENT_ID', 'YOUR_TEMPLATE_ID'];
      var invalid = [];

      Object.keys(config).forEach(function(key) {
        if (typeof config[key] === 'string' && placeholders.indexOf(config[key]) !== -1) {
          invalid.push(key);
        }
      });

      if (invalid.length > 0) {
        var fields = invalid.join(', ');
        var message = 'Placeholder credentials detected for: ' + fields + '. Copy src/assets/environment.example.json to src/assets/environment.json and replace placeholder values with your credentials.';
        console.error('⚠️ Sofia SDK Configuration Error: ' + message + ' Contact enrique.alcazar@omniloy.com to obtain credentials.');
        $scope.configError = message;
        return false;
      }

      $scope.configError = '';
      return true;
    };

    /**
     * Initialize environment configuration
     * @param {Object} config - Configuration object
     */
    $scope.initializeEnvironment = function(config) {
      $scope.patientId = config.patientId;
      $scope.templateId = config.templateId;
      $scope.userId = config.userId;
      $scope.baseUrl = config.baseUrl;
      $scope.wssUrl = config.wssUrl;
      $scope.apiKey = config.apiKey;
      $scope.isOpen = config.isOpen;
      $scope.language = config.language || 'es';
      $scope.debug = config.debug ?? false;

      if (config.patientData) {
        $scope.patientData = { ...DEFAULT_PATIENT_DATA, ...config.patientData };
        $scope.patientDataJson = JSON.stringify($scope.patientData);
        $scope.patientDataString = JSON.stringify($scope.patientData, null, 2);
      }

      $scope.validateConfig(config);
      $scope.configLoaded = true;
      // Defer setup to next digest cycle so ng-if renders the element first
      $timeout(function() {
        $scope.setupComponentWithRetry(3, 500);
      }, 0);
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
          if ($scope.debug) console.error(`Failed to initialize SofIA component after ${maxAttempts} attempts`);
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

      // ===== SDK INTEGRATION START =====
      // Minimal code needed to integrate the Sofia SDK web component.
      // Everything between START and END is the core integration pattern.

      // 1. Set required attributes
      component.setAttribute('baseurl', $scope.baseUrl);
      component.setAttribute('wssurl', $scope.wssUrl);
      component.setAttribute('apikey', $scope.apiKey);
      component.setAttribute('userid', $scope.userId);
      component.setAttribute('patientid', $scope.patientId);
      component.setAttribute('templateid', $scope.templateId);

      // 2. Set optional attributes
      component.setAttribute('isopen', $scope.isOpen ? 'true' : 'false');
      component.setAttribute('language', $scope.language || 'es');
      if ($scope.debug) {
        component.setAttribute('debug', 'true');
      }

      // Set JSON attributes only if they are valid
      try {
        if ($scope.templateObject && Object.keys($scope.templateObject).length > 0) {
          component.setAttribute('template', JSON.stringify($scope.templateObject));
        }
      } catch (e) {
        if ($scope.debug) console.warn('Error setting template:', e);
      }

      try {
        if ($scope.patientData) {
          component.setAttribute('patientdata', JSON.stringify($scope.patientData));
        }
      } catch (e) {
        if ($scope.debug) console.warn('Error setting patientdata:', e);
      }

      // 3. Set required callbacks
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

      // ===== SDK INTEGRATION END =====

      // Add event listeners with cleanup tracking
      function addTrackedListener(el, event, handler) {
        el.addEventListener(event, handler);
        eventListeners.push({ element: el, event: event, handler: handler });
      }

      addTrackedListener(component, 'handle-report', function(event) {
        $scope.handleReport(event.detail);
      });

      addTrackedListener(component, 'set-is-open', function(event) {
        $scope.setIsOpen(event.detail);
      });

      addTrackedListener(component, 'set-get-last-report', function(event) {
        $scope.setGetLastReport(event.detail);
      });

      $scope.componentInitialized = true;
    }

    // Clean up event listeners when scope is destroyed
    $scope.$on('$destroy', function() {
      eventListeners.forEach(function(entry) {
        entry.element.removeEventListener(entry.event, entry.handler);
      });
      eventListeners = [];
    });

    // Load environment configuration
    $http.get('assets/environment.json')
      .then(function(response) {
        const environment = response.data;
        $scope.initializeEnvironment(environment);
      })
      .catch(function(error) {
        if ($scope.debug) console.error('Error loading environment:', error);
        $scope.initializeEnvironment({});
      });
  }
]);

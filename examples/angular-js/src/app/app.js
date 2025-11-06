var app = angular.module('myApp', ['ngRoute']);

// Configure routes
app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/views/main.html',
      controller: 'MainController'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

// Register global error handler for debugging
window.addEventListener('error', function(event) {
  console.error('Global error:', event.error || event.message);
});
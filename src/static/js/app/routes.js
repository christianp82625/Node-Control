control.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/agent_health', {templateUrl: 'templates/agent_health_parent.html',   controller: agentController}).
      when('/agent_detail', {templateUrl: 'templates/agent_details_parent.html',   controller: agentController}).
      when('/agent_list', {templateUrl: 'templates/agent_list_parent.html',   controller: agentController}).
      when('/timeline', {templateUrl: 'templates/timeline_parent.html',   controller: commandController}).
      when('/command_line', {templateUrl: 'templates/command_line_parent.html',   controller: commandController}).
      when('/test_parameters', {templateUrl: 'templates/test_parameters_parent.html',   controller: testController}).
      when('/traffic_parameters', {templateUrl: 'templates/traffic_parameters_parent.html',   controller: trafficController}).
      when('/traffic_chart', {templateUrl: 'templates/traffic_chart_parent.html',   controller: agentController}).
      when('/traceroute', {templateUrl: 'templates/traceroute_filter.html', controller: 'tracerouteFilterCtrl'}).
      when('/rest_api', {templateUrl: 'templates/rest_api_parent.html', controller: commandController}).
      when('/login', {templateUrl: 'templates/login.html', controller: gridController}).
      when('/logout', {templateUrl: 'templates/logout.html', controller: gridController}).
      when('/account', {templateUrl: 'templates/account.html', controller: gridController}).
      when('/unit_test', {templateUrl: 'templates/unit_test_parent.html', controller: gridController}).
      otherwise({redirectTo: '/'});
}]);

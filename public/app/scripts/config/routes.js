
var routes = angular.module('control.Routes', []);

routes.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    if(CONFIG.routing.html5Mode) {
      $locationProvider.html5Mode(true);
    }
    else {
      var routingPrefix = CONFIG.routing.prefix;
      if(routingPrefix && routingPrefix.length > 0) {
        $locationProvider.hashPrefix(routingPrefix);
      }
    }

    ROUTER.when('home_path', '/home', {
      templateUrl : CONFIG.prepareViewTemplateUrl('home')
    });

    ROUTER.when('agent_health_path', '/agent_health', {
      templateUrl : CONFIG.prepareViewTemplateUrl('agent_health_parent')
    });

    ROUTER.when('agent_detail_path', '/agent_detail', {
      templateUrl : CONFIG.prepareViewTemplateUrl('agent_details_parent')
    });

    ROUTER.when('agent_list_path', '/agent_list', {
      templateUrl : CONFIG.prepareViewTemplateUrl('agent_list_parent')
    });

    ROUTER.when('timeline_path', '/timeline', {
      templateUrl : CONFIG.prepareViewTemplateUrl('timeline_parent')
    });

    ROUTER.when('command_line_path', '/command_line', {
      templateUrl : CONFIG.prepareViewTemplateUrl('command_line_parent')
    });

    ROUTER.when('test_parameters_path', '/test_parameters', {
      templateUrl : CONFIG.prepareViewTemplateUrl('test_parameters_parent')
    });

    ROUTER.when('designer_path', '/designer', {
      templateUrl : CONFIG.prepareViewTemplateUrl('designer_parent')
    });
    
    ROUTER.when('traffic_parameters_path', '/traffic_parameters', {
      templateUrl : CONFIG.prepareViewTemplateUrl('traffic_parameters_parent')
    });

    ROUTER.when('traffic_chart_path', '/traffic_chart', {
      templateUrl : CONFIG.prepareViewTemplateUrl('traffic_chart_parent')
    });

    ROUTER.when('traceroute_path', '/traceroute', {
      templateUrl : CONFIG.prepareViewTemplateUrl('traceroute_filter')
    });

    ROUTER.when('rest_api_path', '/rest_api', {
      templateUrl : CONFIG.prepareViewTemplateUrl('rest_api_parent')
    });

    ROUTER.when('login_path', '/login', {
      templateUrl : CONFIG.prepareViewTemplateUrl('login')
    });

    ROUTER.when('logout_path', '/logout', {
      templateUrl : CONFIG.prepareViewTemplateUrl('logout')
    });

    ROUTER.when('account_path', '/account', {
      templateUrl : CONFIG.prepareViewTemplateUrl('account')
    });

    ROUTER.when('unit_test_path', '/unit_test', {
      templateUrl : CONFIG.prepareViewTemplateUrl('unit_test_parent')
    });

    // Admin routes
    ROUTER.when('organizations_path', '/organizations', {
      templateUrl : CONFIG.prepareViewTemplateUrl('admin/organizations/index')
    });

    ROUTER.when('users_path', '/users', {
      templateUrl : CONFIG.prepareViewTemplateUrl('admin/users/index')
    });

    ROUTER.when('users_organizations_path', '/users_organizations', {
      templateUrl : CONFIG.prepareViewTemplateUrl('admin/users_organizations/index')
    });

    ROUTER.when('organization_licenses_path', '/licenses', {
      templateUrl : CONFIG.prepareViewTemplateUrl('admin/licenses/index')
    });

    ROUTER.otherwise({
      redirectTo : '/'
    });

    ROUTER.install($routeProvider);

  }]);

routes.config(['$httpProvider', 'ngProgressLiteProvider', 'growlProvider',
  function ($httpProvider, ngProgressLiteProvider, growlProvider) {

    ngProgressLiteProvider.settings.speed = 500;
    ngProgressLiteProvider.settings.ease = 'ease-in';
    growlProvider.globalTimeToLive(5000);

    var interceptor = ['$rootScope', '$q', function(scope, $q) {

      function success( response ) {
        return response;
      };

      function error( response ) {
//        if ( !!response || response.status == 500) { // server is down
        if ( response === undefined ) { // server is down
          var deferred = $q.defer();
          scope.$broadcast('event:serverdown');
          return deferred.promise;
        };
        return $q.reject( response );
      };

      return function( promise ) {
        return promise.then( success, error );
      };

    }];

    $httpProvider.responseInterceptors.push( interceptor );

  }]);

routes.run(['$rootScope', '$location', '$flash', 'Session', function($rootScope, $location, $flash, Session) {

    $rootScope.$on('event:serverdown', function( event ) {
      $flash.notify('alert alert-danger fade in', 'Server does not respond.', '');
    });

    $rootScope.$on('$locationChangeStart', function(event, next, current) {
      // Request Current User and Wait Until Resolved
      Session.requestCurrentUser().then(function(res) {
        // Check If Route require admin
  //      if (routeClean($location.url()) && !Session.currentUser) {
        if (!Session.currentUser) {
          console.log('Not Logged In');
          event.preventDefault();
          $rootScope.loggedIn = false;
          $location.path('/login');
        }

      });
    });

  }]);

routes.run(['$rootScope', '$location', function($rootScope, $location) {
    var prefix = '';
    if(!CONFIG.routing.html5Mode) {
      prefix = '#' + CONFIG.routing.prefix;
    }
    $rootScope.route = function(url, args) {
      return prefix + ROUTER.routePath(url, args);
    };
    $rootScope.r = $rootScope.route;
    $rootScope.c = function(route, value) {
      var url = ROUTER.routePath(route);
      if(url == $location.path()) {
        return value;
      }
    };
  }]);

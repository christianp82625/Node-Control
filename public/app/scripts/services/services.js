/**
 * Created by aldo on 1/3/14.
 */
'use strict';

var services = angular.module('control.Services', []);

services.factory('Account', [ '$http', '$a', function($http, $q) {

    //Main service calls
    var service = {

      create: function(user) {
        var request = $http.post('/account', user);
        var promise = request.then(function(response) {
          if (response.data.success == true) {
            service.currentUser = response.data.user;
            return true;
          } else {
            service.message = response.data.message;
            return false;
          }
        });
        return promise;
      },

      message: null,

      getMessage: function() {
        return service.message;
      }
    } ;

    return service;
  }])

services.factory('Agents', [ '$http', function Agents($http) {

    $http({
      url: "/query/agents/active",
      dataType: "json",
      method: "GET"
    }).success(function(data, status, headers, config) {
        console.log(data)
        Agents=data
        return  Agents
      }).error(function(data, status, headers, config) {
        Agents = [{ a:1}]
        return  Agents
      });

  }])

services.factory('Commands', function () {
    var Commands = {};
    Commands.list = [
      { category: "Agent Commands", command : "rw_agent_show_active", description: " List active agent IP's (registered last 6m)" },
      { category: "Agent Commands", command : "rw_agent_count", description:  "Count of active agent IP's (registered last 6m)" },
      { category: "Agent Commands", command : "rw_agent_ssh  ip", description: "SSH into ubuntu@ the agent by IP" },
      { category: "Agent Commands", command : "rw_agent_reboot ip", description: "Reboot an agent" },
      { category: "Agent Commands", command : "rw_agent_show_ec2", description: "Show all RW_FF on RedWolf & Status" },

      { category: "Broadcast Commands", command : "rw_broadcast command", description: "Send command to registered agents only" },
      { category: "Broadcast Commands", command : "rw_broadcast_all command", description: "Send command to ALL RW_FF agents (slow!)" },
      { category: "Broadcast Commands", command : "rw_broadcast_unregistered command", description: "Send command to unregistered agents only (slow!)" },

      { category: "Attack Commands", command : "rw_attack_init", description: "Stops all attacks" },

      { category: "Command Management", command : "rw_attack_command_show", description: "Displays the current bullet" },
      { category: "Command Management", command : "rw_attack_command_select command", description: "Copies /commands/$filename to bullet" },

      { category: "Per-Agent Commands", command : "rw_attack_agent_show", description: "Shows the currently attacking agents" },
      { category: "Per-Agent Commands", command : "rw_attack_agent_show_enabled", description: "List the IP's of enabled agents" },
      { category: "Per-Agent Commands", command : "rw_attack_agent_show_ready", description: "List the IP's of ready (not enabled) agents" },

      { category: "Per-Agent Commands", command : "rw_attack_agent_enable [ip ip2 ip3]", description: "Copies the bullet to the agent, if it exists" },
      { category: "Per-Agent Commands", command : "rw_attack_agent_disable [ip] [ip] [ip]", description: "Removes a command from specified agent" },

      { category: "Per-Agent Commands", command : "rw_attack_agent_update", description: "Update all running attacks to latest bullet ***untested" },
      { category: "Per-Agent Commands", command : "rw_attack_agent_broadcast", description: "Copies the bullet to all directories" },

      { category: "Group Commands", command : "rw_attack_groups_show", description: "# Show agents & current status  (GOOD!)" },
      { category: "Group Commands", command : "rw_attack_group_enable [group#]", description: "Enables a specific group" },
      { category: "Group Commands", command : "rw_attack_group_disable [group#]", description: "Disables a group (removes commands)" } ]
    return Commands;
  })

services.factory('$flash' , [ '$rootScope', function($rootScope) {
    var service = {
      notify : function(level, message, element){
        $rootScope.notification =  {
          level: level,
          message: message,
          element: (element || 'default')
        };
        $rootScope.$emit("event:ngNotification");
      }
    };
    return service;
  }])

services.factory('Session', [ '$http', '$q', function($http, $q) {

    //Main service calls
    var service = {

      login: function(user) {
        var request = $http.post('/login', user);
        var promise = request.then(function(response) {
          if (response.data.success == true) {
            service.currentUser = response.data.data.user;
            service.message = response.data.message;
            return true;
          } else {
            service.message = response.data.message;
            return false;
          }
        });
        return promise;
      },

      logout: function() {
        var request = $http.get('/logout');
        var promise = request.then(function(response) {
          if(response.data.success == true) {
            service.currentUser = null;
            service.message = response.data.message;
            return true;
          } else {
            return false;
          }
        });
        return promise;
      },

      // Ask the backend to see if a user is already authenticated - this may be from a previous session.
      requestCurrentUser: function() {
        if ( service.isAuthenticated() ) {
          return $q.when(service.currentUser);
        } else {
          var request = $http.get('/checkuser');
          var promise = request.then(function(response) {
            if (response.data.success == true) {
              service.currentUser = response.data.data.user;
            } else {
              service.currentUser = null;
            }
            return service.currentUser;
          });
          return promise;
        }
      },

      //CurrentUser information
      currentUser: null,
      message: null,

      getMessage: function() {
        return service.message;
      },

      isAuthenticated: function() {
        return !!service.currentUser;
      }
    } ;

    return service;

  }])

services.service('tracerouteData', ['$http', function ($http) {

    var cfg = {
      // the query to get all traceroutes in db
      queryUrl: "/query?mime_type=traceroute/layer4"
    };

    this.query = function(opt) {

      var url = cfg.queryUrl;
      var params = _.chain(opt).pairs().filter(_.last).invoke('join','=').value().join('&');

      if (params) {
        url += '&' + params;
      }

      var request = $http({method: 'get', type: 'json', url: url, cache: true});
      var promise = request.then(function(response) {
        if (response.status == 200) {
          return response.data;
        } else {
          return [];
        }
      });
      return promise;

    };

}]);

services.service('designerData', [ '$http', function Templates($http) {

    var cfg = {
      // the query to get designer data (stencil & inspector)
      queryUrl: "/query?$or:0:mime_type=test-manager/template&$or:0:mime_type=test-manager/inspector"
    };

    this.get = function() {

        // get mock data
        var request = $http({ url: "/templates.json", dataType: "json", method: "GET" });

        var promise = request.then(function(response) {
            if (response.status == 200) {
                return response.data;
            } else {
                return [];
            }
        });

        return promise;
    };

}]);
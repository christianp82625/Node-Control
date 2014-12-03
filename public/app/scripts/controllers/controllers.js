/**
 * Created by aldo on 1/3/14.
 */
'use strict';

var controllers = angular.module('control.Controllers', []);

controllers.controller('accountCtrl', [ '$scope','$http', '$flash', '$log', '$rootScope', '$location', 'Session',
    function ($scope, $http, $flash, $log, $rootScope, $location, Session) {

      $rootScope.loggedIn = false;
      $scope.user = {};

      $scope.submitted = false;

      Session.requestCurrentUser().then(function(user) {
        if (!!user) {
          $rootScope.loggedIn = true;
          $scope.user = user;
        }
      });

      $scope.logout = function() {

        Session.logout().then(function(success) {
          if (success) {
            $rootScope.loggedIn = false;
            $scope.user = null;
            $flash.notify('alert alert-success fade in', Session.getMessage(), '');
            $location.path('/login');
          }
        });

      };

      $scope.login = function (user) {

        if ( $scope.loginForm.$valid ) {
          Session.login(user).then(function(loggedIn) {
            if(!loggedIn) {
              $flash.notify('alert alert-danger fade in', Session.getMessage(), '');
            } else {
              $scope.user = Session.requestCurrentUser();
              $rootScope.loggedIn = loggedIn;
              //        $flash.notify('alert alert-success fade in', Session.getMessage(), '');
              $location.path('/home');
            }
          });
        } else {
          $scope.loginForm.submitted = true;
        }

      }

    }]);

controllers.controller('agentCtrl', [ '$scope', '$http', 'Commands',
    function ($scope, $http, Commands ) {
      $http({method: "GET", url: "/query/agents/active", dataType: "json"}).
        success(function(data, status) {
          $scope.status = status;
          $scope.agents = data
        }).
        error(function(data, status) {
          $scope.data = data || "Request failed";
          $scope.status = status;
        });
    }]);

controllers.controller('commandCtrl', [ '$scope', '$http', 'Commands', 'Agents',
    function ($scope, $http, Commands, Agents) {
      //$scope.agents = Agents;

      $scope.command = {};
      $scope.command.line = "";
      $scope.command.history = [];
      $scope.command.result = {};

      $scope.command.evaljs = function (line) {
        try {
          return eval(line);
        } catch (e) {
          return e.message;
          if (e instanceof SyntaxError) {
            return e.message;
          }
        }
        return "ERR"
      }

      $scope.command.result= "result"

      $scope.command.history_size = 5;

      $scope.allstop = function allstop() {
        return "All Stopped from $scope"
      }

      //    allstop = function allstop() {
      //      $scope.socket.emit('object_push', { mime_type: "eval/command", command : "allstop"})
      //      return "All Stopped from base"
      //    }

      // Web Socket
      /*
       $scope.socket = io.connect('/');
       $scope.socket.emit('object_push', { client_connected : true })
       $scope.socket.on('object_push', function (object) {
       console.log("Got socket at command prompt!")
       console.log(object);
       }); //socket.on
       */
      function deliver( object ) {
        socket.emit('object_push', object )
      }

      //$scope.command.result = alert($scope.commandLine)
      $scope.evalCommand = function (command_line) {
        command_line = $scope.command.line;
        var eval_return = $scope.command.evaljs( command_line )
        $scope.command.line = ""
        $scope.command.result = eval_return;
        $scope.command.history.unshift( { command_line : command_line, result: eval_return })
        if ( $scope.command.history.length >$scope.command.history_size) {
          $scope.command.history.splice(-1)
        }

        return( eval_return )
      }

      $scope.closeCommandHistory = function (index)  {
        $scope.command.history.splice(index, 1);
      }

      $scope.alert = function (event) { alert(event) }

      $scope.method = 'GET';
      $scope.url = '/query';

      $scope.fetch = function() {
        $scope.code = null;
        $scope.response = null;

        $http({method: $scope.method, url: $scope.url}).
          success(function(data, status) {
            $scope.status = status;
            $scope.data = eval(data)
          }).
          error(function(data, status) {
            $scope.data = data || "Request failed";
            $scope.status = status;
          });
      };

      $scope.updateModel = function(method, url) {
        $scope.method = method;
        $scope.url = url;
      };
    }]);

controllers.controller('gridCtrl', ['$scope', '$http','Commands', 'Agents',
    function ($scope, $http, Commands, Agents) {
      $scope.myData = [
        {name: "Moroni", age: 50},
        {name: "Tiancum", age: 43},
        {name: "Jacob", age: 27},
        {name: "Nephi", age: 29},
        {name: "Enos", age: 34}
      ];

      $scope.Commands   = Commands.list;
      $scope.Agents     = Agents.data;
      $scope.dataSelect = "Commands";

      $scope.gridOptions = {
        data: 'myData',
        showGroupPanel: true,
        selectedItems: $scope.mySelections,
        enableSorting: true,
        multiSelect: false
      };

    }]);

controllers.controller('modalDemoCtrl', [ '$scope',
    function ($scope) {

      $scope.open = function () {
        $scope.shouldBeOpen = true;
      };

      $scope.close = function () {
        $scope.closeMsg = 'I was closed at: ' + new Date();
        $scope.shouldBeOpen = false;
      };

      $scope.items = ['item1', 'item2'];

      $scope.opts = {
        backdropFade: true,
        dialogFade:true
      };

    }]);

controllers.controller('tabsDemoCtrl', [ '$scope',
    function ($scope) {
      $scope.tabs = [
        { title:"Dynamic Title 1", content:"Dynamic content 1" },
        { title:"Dynamic Title 2", content:"Dynamic content 2", disabled: true }
      ];

      $scope.alertMe = function() {
        setTimeout(function() {
          alert("You've selected the alert tab!");
        });
      };

      $scope.navType = 'pills';
    }]);

controllers.controller('tcpGeneralCtrl', [ '$scope', '$http',
    function ($scope, $http) {

      $scope.tcp = { "mime_type" : "traffic_genenerator/parameters" };
      $scope.tcp.tcp_type = "SYN"
      $scope.tcp.tcp_speed = "max"
      $scope.tcp.packet_delay = 1
      $scope.tcp.payload_size = 1

    }]);

controllers.controller('testCtrl',[ '$scope', '$http',
    function ($scope, $http) {

      $scope.test = {}
      $scope.test.date = new Date()
      $scope.test.descripiton = ""
      $scope.test.contacts = ""
      $scope.test.maximum_bandwidth=1024*2.5
      $scope.test.maximum_active_agents=300
      $scope.test.maximum_active_agents_per_datacenter=70

    }]);

controllers.controller('timelineCtrl', [ '$scope', '$http', function ($scope, $http) {

    $http({method: "GET", url: "/query?mime_type=traffic_generator/control_log", dataType: "json"}).
      success(function(data, status) {
        $scope.status = status;
        $scope.control_log= data
      }).
      error(function(data, status) {
        $scope.data = data || "Request failed";
        $scope.control_log= status;
      });

    $http({method: "GET", url: "/query?mime_type=traffic_generator/event", dataType: "json"}).
      success(function(data, status) {
        $scope.status = status;
        $scope.events = data
      }).
      error(function(data, status) {
        $scope.data = data || "Request failed";
        $scope.events= status;
      });

  }]);

controllers.controller('tracerouteFilterCtrl', ['$scope', function($scope) {

    $scope.$on('traceroute:dataChanged', function(event, data) {
      event.stopPropagation();
      $scope.traceroutes = data;
    });

    $scope.regex = function (r) {
      return r && ('/' + r + '/');
    };

    //ui select2 options
    $scope.select2opts = { allowClear: true };

    $scope.showHops = {
      color: 0.0,
      last: 3,
      first: 3,
      format: function(lstOr1st) {
        var val = this[lstOr1st];
        return val < 12 ? lstOr1st + ' ' + val : 'all ' + lstOr1st;
      },
      get: function(lstOr1st) {
        var val = this[lstOr1st];
        return !val || val > 11 ? 0 : val;
      }
    };

    $scope.timeranges = [
      { time: 230400, text: '-48 hours'  },
      { time: 115200, text: '-24 hours'  },
      { time:  57600, text: '-12 hours'  },
      { time:  28800, text: '-8 hours'   },
      { time:  14400, text: '-4 hours'   },
      { time:   7200, text: '-2 hours'   },
      { time:   3600, text: '-1 hour'    },
      { time:   1800, text: '-30 minutes'},
      { time:    900, text: '-15 minutes'},
      // only for testing purposes
      { time: Date.now(), text: 'any (testing)' }
    ];

    _.each($scope.timeranges, function(range) {
      range.time = this.epochTimeSec - range.time;
    },{
      epochTimeSec: Math.round(new Date().getTime()/1000.0)
    });

    $scope.time = $scope.timeranges[3].time;

  }]);

controllers.controller('trafficViewCtrl', [ '$scope', '$http',
    function ($scope, $http) {
      $scope.from = "-8hour"
   }]);

controllers.controller('unitTestCtrl', [ '$scope', '$http', 'Commands',
    function ($scope, $http, Commands ) {

      $http({method: "GET", url: "/query?mime_type=unit/test", dataType: "json"}).
        success(function(data, status) {
          $scope.status = status;
          $scope.tests = data
        }).
        error(function(data, status) {
          $scope.data = data || "Request failed";
          $scope.status = status;
        });
  }]);


controllers.controller('designerCtrl', [ '$scope','$http', '$flash', '$log', '$rootScope', '$location',
    function ($scope, $http, $flash, $log, $rootScope, $location) {

        console.log('designerCtrl');
        
    }]);





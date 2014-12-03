// Traceroute filter controller

control.controller('tracerouteFilterCtrl', ['$scope', function($scope) {

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

// filters

control.filter('uniq', function() {
    
    return function(array, key, isSorted) {
	return _.uniq(array, isSorted, function(el) { return _.result(el,key) });
    }
});
	       
control.filter('pluck', function() {

    return function(array, key, shallow) {
	return _.chain(array).pluck(key).flatten(shallow !== false).value();
    }
});

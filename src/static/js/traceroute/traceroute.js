// directives

control.directive('traceroutes', ['Joint', function(Joint) {

    var cfg = {

	attributesQueryMapping: {
	    'from':                                '@from',
	    'to':                                  '@to',
	    'transaction_id':                      '@transactionId',
	    '$or:0:hops:$elemMatch:$or:0:hop_ip':  '@filter',
	    '$or:0:hops:$elemMatch:$or:1:as':      '@filter',
	    '$or:0:hops:$elemMatch:$or:2:as_name': '@filter',
	    '$or:1:from':                          '@filter',
	    '$or:2:to':                            '@filter',
	    'timestamp_epoch_s:$gt':               '@timeFromEpochS',
	    'timestamp_epoch_s:$lt':               '@timeToEpochS',
	    'hops:$elemMatch:$or:0:as_name':       '@asnFilter',
	    'hops:$elemMatch:$or:1:as':            '@asnFilter',
	    '$and:0:hops:$elemMatch:hop_ip':       '@ipFilter'
	},

	// the effect of a change is taken after short period (cfg.queryDelay)
	delayedQueryAttributes: [
	    '@filter'
	],

	// to change this attribute won't trigger traceroute displaying
	deniedQueryTriggers: [
	    '@timeFromEpochS',
	    '@timeToEpochS'
	],

	// query db debounce time in ms
	queryDelay: 1000,

	// default HTML directive tag attributes
	defaultTagAttrs: {
	    width: '100%'
	}
    }

    return {

	restrict: 'E',

	replace: true,

	templateUrl: '/templates/traceroute.html',

	scope: _.extend({

	    width: '=?',
	    height: '=?',
	    showFirstNHops: '@',
	    showLastNHops: '@',
	    highlightSlowHopsMs: '@'

	}, cfg.attributesQueryMapping),

	controller: [ '$scope', 'tracerouteData', function($scope, tracerouteData) {

	    _.defaults($scope, cfg.defaultTagAttrs);

	    var queryParamKeys = _.keys(cfg.attributesQueryMapping);

	    $scope.fetchData = function(opt, callback) {

		// display loading spinner
		$scope.spinner = true;

		// make sure only proper query parameters to be passed to db
		var queryParams = _.pick(opt || {}, queryParamKeys);

		$scope.traceroutes = tracerouteData.query(queryParams);

		if (_.isFunction(callback)) {
		    $scope.traceroutes.then(callback);
		}
	    }

	    $scope.spinner = false;
	}],

	link: function(scope, element, attrs) {

	    function getQueryAttrs(fn, group) {
		return _.chain(cfg.attributesQueryMapping)
		    .invert()[fn](group)
		    .values()
		    .value();
	    }

	    function attrsValueFn(getter) { return function() {
		return _.values(_.pick(scope, getter));
	    }};

	    var queryAttrs = getQueryAttrs('omit', cfg.deniedQueryTriggers);
	    var instantQueryAttrs = getQueryAttrs('omit', cfg.delayedQueryAttributes);
	    var delayedQueryAttrs = getQueryAttrs('pick', cfg.delayedQueryAttributes);

	    Joint.joint().then(function() {

		var graph = new joint.dia.Graph;

                var paper = new joint.dia.Paper({
		    el: element.find('.paper')[0],
		    gridSize: 1,
		    model: graph,
                    linkView: joint.dia.LightLinkView
                });

		paper.$el.css({ overflow: 'auto', width: scope.width, height: scope.height });

		// traceroute view

                var traceroutesView = new joint.viz.Traceroutes({
                    paper: paper,
                    graph: graph
                });

		function hopsHighlight(ms) {
		    if (ms > 0) {
			traceroutesView.highlightHopsByLatency(ms);
		    } else {
			traceroutesView.unhighlightHops();
		    }
		};

		function renderView(data) {

		    traceroutesView.render(data);
		    hopsHighlight(scope.highlightSlowHopsMs);

		    if (_.isUndefined(scope.height)) {
			paper.$el.css('height', data && data.length > 0 ? paper.options.height + 20 : 0);
		    }
		};

		function clearView() {

		    graph.resetCells();

		    if (_.isUndefined(scope.height)) {
			paper.$el.css('height', 0);
		    }
		};

		// hop detail

                paper.on('cell:pointerdown', function(cellView, evt) {

                    if (cellView.model instanceof joint.dia.Link) return;
                    
                    evt.stopPropagation();
                    
                    var hopDiagram = new joint.viz.HopDiagram({
                        paper: paper,
                        graph: graph,
                        cellView: cellView
                    });

                    hopDiagram.render();
                    var bbox = cellView.getBBox();
                    hopDiagram.$el.css({ left: bbox.x + bbox.width, top: bbox.y + bbox.height });
                });

		// data watching

		var backupData = [];

		scope.$watchCollection('traceroutes', function(data) {

		    if (!data) return;

		    //hide loading spinner
		    scope.spinner = false;

		    scope.$emit('traceroute:dataChanged', data);
		    backupData = _.cloneDeep(data);
		});

		// attributes watching

		var instantDataFetch = function() {
		    scope.fetchData(scope, _.some(attrsValueFn(queryAttrs)()) ? renderView : clearView);
		};

		var delayedDataFetch = _.debounce(function(a, b) {
		    // If a,b values are identical (===) then the listener was called due to initialization.
		    _.isEqual(a,b) || scope.$apply(instantDataFetch);
		}, cfg.queryDelay);

		scope.$watch(attrsValueFn(instantQueryAttrs), instantDataFetch, true);

		scope.$watch(attrsValueFn(delayedQueryAttrs), delayedDataFetch, true);

		// showing last/first N hops

		var delayedUpdate = _.debounce(function(type, value) {
		    scope.$apply(function() {
			traceroutesView.options[type] = value;
			renderView(backupData);
		    });
		}, 300);

		scope.$watch('showFirstNHops', function(countHops) {

		    countHops = parseInt(countHops, 10);

		    // in case there are no filters set yet
		    traceroutesView.options.showFirstHops = countHops;

		    if (_.some(attrsValueFn(queryAttrs)())) {
			// update the traceroutes just in case there are some filters set
			delayedUpdate('showFirstHops',countHops);
		    }
		});

		scope.$watch('showLastNHops', function(countHops) {

		    countHops = parseInt(countHops, 10);

		    // in case there are no filters set yet
		    traceroutesView.options.showLastHops = countHops;

		    if (_.some(attrsValueFn(queryAttrs)())) {
			// update the traceroutes just in case there are some filters set
			delayedUpdate('showLastHops',countHops);
		    }
		});

		// hops highlighting

		var delayedHopsHighlight = _.debounce(hopsHighlight, 200);

		scope.$watch('highlightSlowHopsMs', function(ms) {

		    ms = parseFloat(ms);
		    delayedHopsHighlight(ms);
		});
	    });
	}
    }
}]);

// services

control.service('tracerouteData', ['$http', function ($http) {

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

	console.log(url);

	return $http({
	    method: 'GET',
	    type: 'json',
	    url: url,
	    cache: true
	}).then(function(response) {

	    // success
	    return response.data;

	}, function() {

	    // error
	    return [];
	});
    };
}]);



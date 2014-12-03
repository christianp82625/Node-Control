/**
 * Created by aldo on 1/3/14.
 */
'use strict';

var directives = angular.module('control.Directives', []);

directives.directive('angulard3BarGraph', function () { // Angular Directive
    return {
      restrict: 'A', // Directive Scope is Attribute
      scope: {
        datajson: '=',
        xaxisName: '=',
        xaxisPos: '=',
        yaxisName: '=',
        yaxisPos: '=',
        d3Format: '='
        // All the Angular Directive Vaiables used as d3.js parameters
      },
      link: function (scope, elem, attrs) {
        // The d3.js code for generation of bar graph. further reading should be done from http://d3js.org/
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

        var formatPercent = d3.format(scope.d3Format); // formatting via angular variable

        var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
          .range([height, 0]);

        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickFormat(formatPercent);

        var svg = d3.select("#"+elem[0].id).append("svg") // selecting the DOM element by d3.js
          // - getting from Angular context
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.json(scope.datajson, function(error, data) { // external data filename- angular directive variable
          if (error) return console.warn(error);

          x.domain(data.map(function(d) { return d.letter; }));
          y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("x", scope.xaxisPos)
            .attr("dx", ".71em")
            .style("text-anchor", "end")
            .text(scope.xaxisName);
          // x axis legend setting from angular variables
          svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", scope.yaxisPos)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(scope.yaxisName);
          // y axis legend setting from angular variables
          svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.letter); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.frequency); })
            .attr("height", function(d) { return height - y(d.frequency); });
        });
      }
    }
  });

directives.directive( 'customSubmit' , function() {
    return {
      restrict: 'A',
      link: function( scope , element , attributes )
      {
        var $element = angular.element(element);

        // Add novalidate to the form element.
        attributes.$set( 'novalidate' , 'novalidate' );

        $element.bind( 'submit' , function( e ) {
          e.preventDefault();

          // Remove the class pristine from all form elements.
          $element.find( '.ng-pristine' ).removeClass( 'ng-pristine' );

          // Get the form object.
          var form = scope[ attributes.name ];

          // Set all the fields to dirty and apply the changes on the scope so that
          // validation errors are shown on submit only.
          angular.forEach( form , function( formElement , fieldName ) {
            // If the fieldname starts with a '$' sign, it means it's an Angular
            // property or function. Skip those items.
            if ( fieldName[0] === '$' ) return;

            formElement.$pristine = false;
            formElement.$dirty = true;
          });

          // Do not continue if the form is invalid.
          if ( form.$invalid ) {
            // Focus on the first field that is invalid.
            $element.find( '.ng-invalid' ).first().focus();

            return false;
          }

          // From this point and below, we can assume that the form is valid.
          scope.$eval( attributes.customSubmit );

          scope.$apply();
        });
      }
    };
  });

directives.directive('ngNotice', [ '$rootScope', '$timeout', function($rootScope, $timeout) {
    var noticeObject = {
      replace: false,
      transclude: false,
      link: function (scope, element, attr){
        $rootScope.$on("event:ngNotification", function(event){
          if (attr.ngNotice == $rootScope.notification.element) {
            element.html("<div class=\""+ $rootScope.notification.level + "\">" +
              "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>" +
              "<span><strong>" + $rootScope.notification.message + "</strong></span></div>");
            element.show();
            $timeout(function() {
              element.hide();
            }, 3000);
          }
        });
        $rootScope.notification = null;
        attr.ngNotice = attr.ngNotice || 'default';
      }
    };
    return noticeObject;
  }]);

directives.directive('timeseries', ['$compile', '$timeout' ,function($compile, $timeout){
    return{
      restrict: 'E',
      replace: true,
      _scope: {
        id: '@id',
        title: '@',
        height: '=',
        width: '=',
        target: '@',
        graphonly: '@',
        areamode: '@',
        from: '@'
      },
      template: function( elem, attrs, scope ) {
        if ( attrs.title == null ) {
          attrs.title = ""
        }
        if ( attrs.graphonly == null ) {
          attrs.graphonly = "false"
        }
        var src="/render/?_salt=1363448871.68&areaAlpha=.7&width=" + attrs.width + "&height=" + attrs.height +"&target=" + attrs.target + "&areaMode=" + attrs.areamode +"&from=" + attrs.from + "&to=-1minute&graphOnly=" + attrs.graphonly + "&height=" + attrs.height + "&width=" + attrs.width  + "&title=" + attrs.title
        var img_url = "<img ng-src='" + src + " '>";
        var csv_url = src + "&format=csv";
        var json_url = src + "&format=json";
        var svg_url = src + "&format=svg";
        var anchor = "<a href='" + svg_url + "' target='_svg'>" + img_url  + "</a>";
        return anchor;
      }
    }
  }]);

directives.directive('traceroutes', [function() {

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

      templateUrl: 'templates/views/traceroute.html',

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

          tracerouteData.query(queryParams).then(function(data) {
            $scope.traceroutes = JSON.parse(JSON.stringify(data));
            if (_.isFunction(callback)) {
              callback(JSON.parse(JSON.stringify(data)));
            }
          });
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
      }
    }
  }]);

directives.directive('designer', [function() {

    var paper;
    var graph;
    var paperScroller;
    var stencil;
    var selection;
    var selectionView;
    var inspector;
    var clipboard;
    var commandManager;

    var InspectorDefs = {};

    var Stencil = {

        groups: {
            templates: { index: 1, label: 'Templates' },
            targets: { index: 2, label: 'Targets' },
            agents: { index: 3, label: 'Agents' },
            savedTests: { index: 4, label: 'Saved Tests' }
        },

        shapes: { /* we'll get them from db in controller */ }
    };

    joint.shapes.redwolf = {};

    joint.shapes.redwolf.Template = joint.dia.Element.extend({

        markup: '<g class="rotatable"><g class="scalable"><rect/><image/></g><text/></g>',

        defaults: joint.util.deepSupplement({

            type: 'redwolf.Template',
            attrs: {

                rect: {
                    width: 180, height: 120,
                    fill: '#FFFFFF', stroke: '#000000', 'stroke-width': 2, 'stroke-opacity': .3,
                    rx: 10, ry: 10
                },

                image: {
		    width: 100, height: 100,
                    ref: 'rect', 'ref-x': 5, 'ref-y': 5, opacity: .3
                },

                text: {
                    'font-weight': 'bold', 'font-size': 10, fill: 'white',
                    ref: 'rect', 'ref-dx': -5, 'ref-dy': -20, 'y-alignment': 'middle',
		    'text-anchor': 'end', style: { textShadow: '0.1em 0.1em 0.2em black' }
                }
            }

        }, joint.dia.Element.prototype.defaults)

    });

    function getShape(template) {

        var label = (template.name || '').replace(/\ /g,'\n');

        return new joint.shapes.redwolf.Template(joint.util.deepSupplement({
            inspector: template.inspector,
            size: { width: 105, height: 70 },
            attrs: {
                rect: { fill: template.color || '#27AE60' },
                text: { text: label },
                image: { 'xlink:href': template.icon || 'img/icons/default.png' }
            }
        }, template.parameters || {}));
    }

    // Create a graph, paper and wrap the paper in a PaperScroller.
    function initializePaper(element) {
        
        graph = new joint.dia.Graph;

        paperScroller = new joint.ui.PaperScroller({ autoResizePaper: true });

        paper = new joint.dia.Paper({
            el: paperScroller.el,
            width: 1000,
            height: 1000,
            gridSize: 10,
            perpendicularLinks: true,
            model: graph,
            defaultLink: new joint.dia.Link({
                attrs: {
                    '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z', transform: 'scale(0.001)' },
                    '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' },
                    '.connection': {}
                }
            })
        });
        paperScroller.options.paper = paper;

        $(element.find('.paper-container')[0]).append(paperScroller.render().el);

        paperScroller.center();
    }

    // Create stencil.
    function initializeStencil() {

        stencil = new joint.ui.Stencil({
            graph: graph,
            paper: paper,
            width: 240,
            groups: Stencil.groups
        });

        $('.stencil-container').append(stencil.render().el);
        $('.stencil-container .btn-expand').on('click', _.bind(stencil.openGroups, stencil));
        $('.stencil-container .btn-collapse').on('click', _.bind(stencil.closeGroups, stencil));
    };

    function populateStencil() {

        _.each(Stencil.groups, function(group, name) {
            
            stencil.load(Stencil.shapes[name], name);
            
            joint.layout.GridLayout.layout(stencil.getGraph(name), {
                columnWidth: stencil.options.width / 2 - 10,
                columns: 2,
                rowHeight: 75,
                dy: 10,
                dx: 10
            });

            stencil.getPaper(name).fitToContent(1, 1, 10);

            //this.initializeStencilTooltips();
        });
    };


    function initializeInspectorTooltips() {
        
        inspector.on('render', function() {

            inspector.$('[data-tooltip]').each(function() {

                var $label = $(this);
                new joint.ui.Tooltip({
                    target: $label,
                    content: $label.data('tooltip'),
                    right: '.inspector',
                    direction: 'right'
                });
            });
            
        });
    }

    function initializeSelection() {
        
        selection = new Backbone.Collection;
        selectionView = new joint.ui.SelectionView({ paper: paper, graph: graph, model: selection });

        // Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
        // Otherwise, initiate paper pan.
        paper.on('blank:pointerdown', function(evt, x, y) {

            if (_.contains(KeyboardJS.activeKeys(), 'shift')) {
                selectionView.startSelecting(evt, x, y);
            } else {
                paperScroller.startPanning(evt, x, y);
            }
        });

        paper.on('cell:pointerdown', function(cellView, evt) {
            // Select an element if CTRL/Meta key is pressed while the element is clicked.
            if ((evt.ctrlKey || evt.metaKey) && !(cellView.model instanceof joint.dia.Link)) {
                selectionView.createSelectionBox(cellView);
                selection.add(cellView.model);
            }
        });

        selectionView.on('selection-box:pointerdown', function(evt) {
            // Unselect an element if the CTRL/Meta key is pressed while a selected element is clicked.
            if (evt.ctrlKey || evt.metaKey) {
                var cell = selection.get($(evt.target).data('model'));
                selectionView.destroySelectionBox(paper.findViewByModel(cell));
                selection.reset(selection.without(cell));
            }
        });

        // Disable context menu inside the paper.
        // This prevents from context menu being shown when selecting individual elements with Ctrl in OS X.
        paper.el.oncontextmenu = function(evt) { evt.preventDefault(); };

        KeyboardJS.on('delete, backspace', _.bind(function() {
            
            commandManager.initBatchCommand();
            selection.invoke('remove');
            commandManager.storeBatchCommand();
            selectionView.cancelSelection();
        }));
    }

    function createInspector(cellView) {

        // No need to re-render inspector if the cellView didn't change.
        if (!inspector || inspector.options.cellView !== cellView) {
            
            if (inspector) {
                // Clean up the old inspector if there was one.
                inspector.remove();
            }

            var inspectorDefs = InspectorDefs[cellView.model.get('inspector')];
        
            inspector = new joint.ui.Inspector({
                inputs: inspectorDefs ? inspectorDefs.inputs : {},
                groups: inspectorDefs ? inspectorDefs.groups : {},
                cellView: cellView
            });

            initializeInspectorTooltips();

            inspector.on('render', function() {

                inspector.$('select').select2({
                    width: '200px',
                    allowClear: true
                });
            });

            inspector.render();

            $('.inspector-container').html(inspector.el);
        }
    }

    function initializeHaloAndInspector() {

        paper.on('cell:pointerup', function(cellView, evt) {

            if (cellView.model instanceof joint.dia.Link || selection.contains(cellView.model)) return;

            var halo = new joint.ui.Halo({
                graph: graph,
                paper: paper,
                cellView: cellView,
                boxContent: false
            });

            halo.render();

            // initializeHaloTooltips(halo);

            createInspector(cellView);

            selection.reset([cellView.model]);

        });

        paper.on('link:options', function(evt, cellView, x, y) {

            createInspector(cellView);
        });
    }

    function initializeClipboard() {

        clipboard = new joint.ui.Clipboard;
        
        KeyboardJS.on('ctrl + c', function() {
            // Copy all selected elements and their associated links.
            clipboard.copyElements(selection, graph, { translate: { dx: 20, dy: 20 }, useLocalStorage: true });
        });
        
        KeyboardJS.on('ctrl + v', function() {
            clipboard.pasteCells(graph);
            selectionView.cancelSelection();

            clipboard.pasteCells(graph, { link: { z: -1 }, useLocalStorage: true });

            // Make sure pasted elements get selected immediately. This makes the UX better as
            // the user can immediately manipulate the pasted elements.
            var selectionTmp = [];
            
            clipboard.each(function(cell) {

                if (cell.get('type') === 'link') return;

                // Push to the selection not to the model from the clipboard but put the model into the graph.
                // Note that they are different models. There is no views associated with the models
                // in clipboard.
                selectionTmp.push(graph.getCell(cell.id));
                selectionView.createSelectionBox(paper.findViewByModel(cell));
            });

            selection.reset(selectionTmp);
        });

        KeyboardJS.on('ctrl + x', function() {

            var originalCells = clipboard.copyElements(selection, graph, { useLocalStorage: true });
            commandManager.initBatchCommand();
            _.invoke(originalCells, 'remove');
            commandManager.storeBatchCommand();
            selectionView.cancelSelection();
        });
    }

    function initializeCommandManager() {

        commandManager = new joint.dia.CommandManager({ graph: graph });

        KeyboardJS.on('ctrl + z', function() {

            commandManager.undo();
            selectionView.cancelSelection();
        });
        
        KeyboardJS.on('ctrl + y', function() {

            commandManager.redo();
            selectionView.cancelSelection();
        });
    }

    function initializeToolbar() {

        //initializeToolbarTooltips();
        
        $('#btn-undo').on('click', _.bind(commandManager.undo, commandManager));
        $('#btn-redo').on('click', _.bind(commandManager.redo, commandManager));
        $('#btn-clear').on('click', _.bind(graph.clear, graph));
        $('#btn-svg').on('click', _.bind(paper.openAsSVG, paper));
        $('#btn-png').on('click', openAsPNG);
        $('#btn-zoom-in').on('click', zoomIn);
        $('#btn-zoom-out').on('click', zoomOut);
        $('#btn-fullscreen').on('click', toggleFullscreen);

        // toFront/toBack must be registered on mousedown. SelectionView empties the selection
        // on document mouseup which happens before the click event. @TODO fix SelectionView?
        //$('#btn-to-front').on('mousedown', function(evt) { selection.invoke('toFront'); });
        //$('#btn-to-back').on('mousedown', function(evt) { selection.invoke('toBack'); });
        /*
        $('#input-gridsize').on('change', function(evt) {
            var gridSize = parseInt(evt.target.value, 10);
            $('#output-gridsize').text(gridSize);
            setGrid(gridSize);
        });
        */
    }

    function openAsPNG() {
        
        var windowFeatures = 'menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes';
        var windowName = _.uniqueId('png_output');
        var imageWindow = window.open('', windowName, windowFeatures);

        paper.toPNG(function(dataURL) {
	    imageWindow.document.write('<img src="' + dataURL + '"/>');
        }, { padding: 10 });
    }

    var zoomLevel;
    
    function zoom(newZoomLevel, ox, oy) {

        if (_.isUndefined(zoomLevel)) { zoomLevel = 1; }

        if (newZoomLevel > 0.2 && newZoomLevel < 20) {

	    ox = ox || (paper.el.scrollLeft + paper.el.clientWidth / 2) / zoomLevel;
	    oy = oy || (paper.el.scrollTop + paper.el.clientHeight / 2) / zoomLevel;

	    paper.scale(newZoomLevel, newZoomLevel, ox, oy);

	    zoomLevel = newZoomLevel;
        }
    }

    function zoomOut() { zoom(zoomLevel - 0.2); }
    function zoomIn() { zoom(zoomLevel + 0.2); }

    function toggleFullscreen() {

        var el = document.body;

        function prefixedResult(el, prop) {
            
            var prefixes = ['webkit', 'moz', 'ms', 'o', ''];
            for (var i = 0; i < prefixes.length; i++) {
                var prefix = prefixes[i];
                var propName = prefix ? (prefix + prop) : (prop.substr(0, 1).toLowerCase() + prop.substr(1));
                if (!_.isUndefined(el[propName])) {
                    return _.isFunction(el[propName]) ? el[propName]() : el[propName];
                }
            }
        }

        if (prefixedResult(document, 'FullScreen') || prefixedResult(document, 'IsFullScreen')) {
            prefixedResult(document, 'CancelFullScreen');
        } else {
            prefixedResult(el, 'RequestFullScreen');
        }
    }

    function setGrid(gridSize) {

        paper.options.gridSize = gridSize;
        
        var backgroundImage = getGridBackgroundImage(gridSize);
        $(paper.svg).css('background-image', 'url("' + backgroundImage + '")');
    }

    function getGridBackgroundImage(gridSize, color) {

        var canvas = $('<canvas/>', { width: gridSize, height: gridSize });

        canvas[0].width = gridSize;
        canvas[0].height = gridSize;

        var context = canvas[0].getContext('2d');
        context.beginPath();
        context.rect(1, 1, 1, 1);
        context.fillStyle = color || '#AAAAAA';
        context.fill();

        return canvas[0].toDataURL('image/png');
    }
    
    return {

        restrict: 'E',

        replace: true,

        templateUrl: 'templates/views/designer.html',

        scope: {

            width: '=?',
            height: '=?'

        },

        controller: [ '$scope', 'designerData', function($scope, designerData) {

            designerData.get().then(function(rawData) {

                var data = _.groupBy(rawData, 'mime_type');

                // feed stencil

                Stencil.shapes = {};

                _.each(data['test_manager/template'], function(tmpl) {

                    Stencil.shapes[tmpl.group] = Stencil.shapes[tmpl.group] || [];
                    Stencil.shapes[tmpl.group].push(getShape(tmpl));

                });

                populateStencil();

                // feed inspector

                InspectorDefs = {};

                _.each(data['test_manager/inspector'], function(inspector) {
                    InspectorDefs[inspector.name] = inspector;
                });

            });

        }],

        link: function(scope, element, attrs) {

            initializePaper(element);
            initializeStencil();
            initializeSelection();
            initializeHaloAndInspector();
            initializeClipboard();
            initializeCommandManager();
            initializeToolbar();
        }
    };
}]);



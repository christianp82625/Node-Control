angular.module('joint', [])
    .factory('Joint', ['$document', '$q', '$rootScope', function($document, $q, $rootScope) {

        function injectCss(url) {
            
            var head = document.getElementsByTagName('head')[0];
            var cssnode = document.createElement('link');

            cssnode.type = 'text/css';
            cssnode.rel = 'stylesheet';
            cssnode.href = url;
            head.appendChild(cssnode);
        }

        injectCss('/js/traceroute/joint.min.css');

        var d = $q.defer();

        $script('/js/traceroute/joint.min.js', function() {

          $script([
            '/js/traceroute/joint.layout.DirectedGraph.min.js',
            '/js/traceroute/LightLinkView.js',
            '/js/traceroute/joint.viz.Traceroutes.js',
            '/js/traceroute/joint.shapes.traceroutes.js',
            '/js/traceroute/joint.viz.HopDiagram.js'
          ], function() {

            $rootScope.$apply(function() { d.resolve(window.joint) });
          });
        });

        return {
            joint: function() { return d.promise; }
        };        
    }]);

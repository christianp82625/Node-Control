
// Directive for Graphite Charts (timeseries)
//angular.module('timeseries_module', [])
control.directive('timeseries', function($compile, $timeout){
   return {
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
        if ( attrs.title == null ) { attrs.title = "" }
        if ( attrs.graphonly == null ) { attrs.graphonly = "false" }
        src="/render/?_salt=1363448871.68&areaAlpha=.7&width=" + attrs.width + "&height=" + attrs.height +"&target=" + attrs.target + "&areaMode=" + attrs.areamode +"&from=" + attrs.from + "&to=-1minute&graphOnly=" + attrs.graphonly + "&height=" + attrs.height + "&width=" + attrs.width  + "&title=" + attrs.title
        img_url="<img ng-src='" + src + " '>"
        csv_url = src + "&format=csv"
        json_url = src + "&format=json"
        svg_url = src + "&format=svg"
        anchor = "<a href='" + svg_url + "' target='_svg'>" + img_url  + "</a>"
        return anchor
      }
   }
}
)


control.directive('test', function() {
    return { 
        restrict:'E',
        replace:true,
        templateUrl:'/templates/test.html'
    }
});


angular.module('AngularD3BarGraph', []) // Angular Module Name
    .directive('angulard3BarGraph', function () { // Angular Directive
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

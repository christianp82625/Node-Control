// joint.viz.Traceroutes
// ---------------------

// @require('joint.shapes.traceroutes')
// @require('joint.layout.DirectedGraph')

// A high-level plugin for visualizing traceroutes. These traceroutes may start from multiple hosts
// and end in multiple targets.
// See the `demo/traceroutes_small.js` for an example of the format this plugin expects.

joint.viz = joint.viz || {};
joint.viz.Traceroutes = Backbone.View.extend({

    options: {
        paper: undefined,
        graph: undefined,
        paperPadding: 50,
        hopSize: { width: 15, height: 15 },
        showLastHops: undefined,
        showFirstHops: undefined
    },

    initialize: function() {

        this._cache = {};
        this._highlightedHops = [];
        this.options.paper.$el.addClass('traceroutes');
    },

    render: function(traceroutes) {

        this.traceroutes = JSON.parse(JSON.stringify(traceroutes));
        this.originalTraceroutes = JSON.parse(JSON.stringify(traceroutes));
        
        this._cache = {};
        // Fill the `this._cache` with cells.
        var stats = this.processData();
        
        var graph = this.options.graph;
        var paper = this.options.paper;

        graph.set('traceroutes', traceroutes);

        this.speedupPaper();

        var cells = _.values(this._cache);

        graph.resetCells(cells);
        
        var layoutGraph = joint.layout.DirectedGraph.layout(graph, {
            setLinkVertices: false,
            rankDir: 'LR',
            //debugLevel: 1,
            rankSep: stats.maxHopsCount < 4 ? 160 : (stats.maxHopsCount < 7 ? 120 : 60),
            nodeSep: 20
        });

        var padding = this.options.paperPadding;

        paper.setDimensions(layoutGraph.width + 2*padding, layoutGraph.height + 2*padding);
        V(paper.viewport).attr('transform', 'translate(' + padding + ',' + padding + ')');
        
        return this;
    },

    connectHops: function(hopA, hopB) {

        var latency = hopB.hop_ms;
        
        var link = this._cache[hopA.hop_ip + '->' + hopB.hop_ip];
        if (link) {
            
            // Adjust latency if it is higher than the one previously set.
            if (link.get('latency') < latency) {
                link.set('latency', latency);
                link.attr('.connection/stroke', this.latencyColor(latency));
            }
            
            link.attr('.connection/stroke-width', link.attr('.connection/stroke-width') + .5);
            
        } else {
            
            link = this._cache[hopA.hop_ip + '->' + hopB.hop_ip] = this.makeLink(hopA, hopB);
        }
        if (hopB.lastHiddenHopsCount) {
            link.attr('.label/text', hopB.lastHiddenHopsCount + '');
            link.attr('.label/font-size', 8);
            link.attr('.connection/stroke-dasharray', '5,5');
            link.set('minLen', 3);
        }
        if (hopA.firstHiddenHopsCount) {
            link.attr('.label/text', hopA.firstHiddenHopsCount + '');
            link.attr('.label/font-size', 8);
            link.attr('.connection/stroke-dasharray', '5,5');
            link.set('minLen', 3);
        }
    },
    
    makeLink: function(hopA, hopB) {

        var latency = hopB.hop_ms;

        var link = new joint.dia.Link({
            id: hopA.hop_ip + '->' + hopB.hop_ip,
            source: { id: hopA.hop_ip, selector: 'circle' },
            target: { id: hopB.hop_ip, selector: 'circle' },
            smooth: true,
            attrs: {
                '.connection': {
                    'stroke-width': 1,
                    stroke: this.latencyColor(latency),
                    'stroke-linecap': 'round'
                }
            },
            latency: latency,
            z: -1
        });
        return link;
    },

    makeElement: function(hop) {

        var ip = hop.hop_ip;
        var asn = hop.as_name;
        if (asn) {
            var maxLineLength = 20;
            if (asn.length > maxLineLength) {
                asn = asn.substring(0, maxLineLength) + '\n' + asn.substring(maxLineLength);
            }
        }
        
	var el = new joint.shapes.traceroutes.Hop({
            id: hop.hop_ip,
            mime_type: hop.mime_type,
            last_hop: hop.last_hop,
            size: _.clone(this.options.hopSize),
            attrs: { '.ip': { text: ip }, '.asn': { text: asn } },
            latency: hop.hop_ms,
            ip: ip,
            rank: hop.mime_type == 'traceroute/source' ? 'min' : undefined,
            visits: 1
	});
	return el;
    },

    latencyColor: function(latency) {

	latency = parseFloat(latency);
	if (latency <= .6) return '#27AE60';
	if (latency <= 2) return '#E67E22';
	return '#E74C3C';
    },

    processData: function() {

        var maxHopsCount = 0;
        var firstHops = {};

        if (this.options.showFirstHops || this.options.showLastHops) {

            _.each(this.traceroutes, function(traceroute, i) {

                if (traceroute.hops && traceroute.hops.length) {
                    
                    var hopsLength = traceroute.hops.length;

                    var firstNHops = this.options.showFirstHops;
                    var lastNHops = this.options.showLastHops;

                    if (firstNHops && lastNHops && (firstNHops + lastNHops) >= hopsLength) {
                        return;
                    }
                    
                    var hops;
                    if (lastNHops && !firstNHops) {
                        hops = _.last(traceroute.hops, lastNHops);
                        var firstHop = _.first(hops);
                        firstHop.lastHiddenHopsCount = Math.max(0, hopsLength - lastNHops);
                        
                    } else if (firstNHops && !lastNHops) {
                        hops = _.first(traceroute.hops, firstNHops);
                        var lastHop = _.last(hops);
                        lastHop.firstHiddenHopsCount = Math.max(0, hopsLength - firstNHops);
                        
                    } else {
                        // Both are set.
                        var firstHops = _.first(traceroute.hops, firstNHops);
                        var lastHops = _.last(traceroute.hops, lastNHops);
                        
                        var lastInFirstHops = _.last(firstHops);
                        lastInFirstHops.firstHiddenHopsCount = Math.max(0, hopsLength - lastNHops - firstNHops);
                        var firstInLastHops = _.first(lastHops);
                        firstInLastHops.lasstHiddenHopsCount = Math.max(0, hopsLength - firstNHops - lastNHops);
                        hops = firstHops.concat(lastHops);
                    }

                    if (hops) {
                        traceroute.hops = hops;
                    }
                }
            }, this);
        }
        
        _.each(this.traceroutes, function(traceroute, tracerouteIndex) {

            var hopsCount = (traceroute.hops && traceroute.hops.length) || 0;
            maxHopsCount = Math.max(maxHopsCount, (traceroute.hops && traceroute.hops.length) || 0);

            if (!this._cache[traceroute.from]) {
                this._cache[traceroute.from] = this.makeElement({ hop_ip: traceroute.from, mime_type: 'traceroute/source' });
            }

            var lastHop;
            _.each(traceroute.hops, function(hop, hopIndex) {

                var hopCell = this._cache[hop.hop_ip];
                
                if (!hopCell) {
                    this._cache[hop.hop_ip] = hopCell = this.makeElement(_.extend({ last_hop: hopIndex === hopsCount - 1 }, hop));
                    hopCell.set('traceroutes', [ tracerouteIndex ]);
                    
                } else {
                    hopCell.set('visits', hopCell.get('visits') + 1);
                    hopCell.get('traceroutes').push(tracerouteIndex);
                }

                if (lastHop) this.connectHops(lastHop, hop);

                lastHop = hop;
                
            }, this);

            if (lastHop) {
                this.connectHops({ hop_ip: traceroute.from }, traceroute.hops[0]);
            }
                
        }, this);

        return {

            maxHopsCount: maxHopsCount
        };
    },

    speedupPaper: function() {

        // Override the `resetCells()` method of the paper so that it renders
        // cell views asynchronously in animation frames. This leads to a much higher
        // perceived performance of rendering big graphs, leaving aside it doesn't block the UI.

        if (this._frameId) joint.util.cancelFrame(this._frameId);
        
        var paper = this.options.paper;
        var self = this;

        paper.resetCells = function(cellsCollection) {

            $(this.viewport).empty();

            var cells = cellsCollection.models.slice();

            function drawCells() {

                var allDone = false;
                _.each(_.range(20), function() {

                    var cell = cells.shift();
                    if (cell) {
                        paper.addCell(cell);
                    } else {
                        allDone = true;
                    }
                });

                if (!allDone) {
                    self._frameId = joint.util.nextFrame(drawCells);
                }
            };
            
            drawCells();
        };
        paper.stopListening(paper.model, 'reset');
        paper.listenTo(paper.model, 'reset', _.bind(paper.resetCells, paper));
    },

    highlightHopsByLatency: function(latency) {

        this.unhighlightHops();

        _.each(this.traceroutes, function(traceroute) {

            _.each(traceroute.hops, function(hop) {

                if (hop.hop_ms > latency) {

                    var cell = this.options.graph.getCell(hop.hop_ip);
                    if (cell) {

                        this.highlightHop(cell);
                        this._highlightedHops.push(cell);
                    }
                }
                
            }, this);
        }, this);
    },

    unhighlightHops: function() {
        
        _.each(this._highlightedHops, function(hop) {

            // We first must check wheter this cell is still in the graph. For that,
            // we use the client ID `cid`, not the `id` as there might be a new cell
            // in the graph with the same id (note that we use `hop_ip` as ID).
            if (this.options.graph.getCell(hop.cid)) {

                this.unhighlightHop(hop);
            }
        }, this);
        
        this._highlightedHops = [];
    },

    highlightHop: function(cell) {
        
        cell.attr('circle/stroke-width', 3);
        cell.attr('circle/stroke', '#C0392B');
    },

    unhighlightHop: function(cell) {
        
        cell.attr('circle/stroke-width', 0);
        cell.attr('circle/stroke', 'none');
    }
});
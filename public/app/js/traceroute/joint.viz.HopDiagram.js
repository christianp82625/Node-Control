// joint.viz.HopDiagram
// ---------------------

// A high-level plugin for visualizing hops of traceroutes.

joint.viz = joint.viz || {};
joint.viz.HopDiagram = Backbone.View.extend({

    className: 'hop-diagram',

    options: {
        paper: undefined,
        graph: undefined,
        cellView: undefined,
        width: 300
    },

    templateHopHistory: [
        '<table class="hop-history">',
        '<tr>',
        '<th>Timestamp</th>',
        '<th>Previous Hop</th>',
        '<th>Hop</th>',
        '<th>Next Hop</th>',
        '</table>'
    ].join(''),

    templateHopHistoryItem: [
        '<tr>',
        '<td><%= time %></td>',
        '<td><%= prev_hop_ip %><br/><%= prev_hop_as_name %></td>',
        '<td><%= hop_ip %><br/><%= hop_as_name %></td>',
        '<td><%= next_hop_ip %><br/><%= next_hop_as_name %></td>',
        '</tr>'
    ].join(''),

    initialize: function() {
        
        $(document.body).on('mousedown touchstart', _.bind(this.remove, this));

        this.graph = new joint.dia.Graph;
        this.paper = new joint.dia.Paper({
            el: this.el,
            model: this.graph,
            width: this.options.width,
            linkView: joint.dia.LightLinkView
        });

        this.$history = $(_.template(this.templateHopHistory)());
        this.$el.append(this.$history);

        this.options.paper.$el.append(this.el);
    },

    remove: function() {

        this.graph.clear();
        return Backbone.View.prototype.remove.apply(this, arguments);
    },

    render: function() {

        var hop = this.options.cellView.model;
        var hostGraph = this.options.graph;
        
        var inboundLinks = hostGraph.getConnectedLinks(hop, { inbound: true });
        var outboundLinks = hostGraph.getConnectedLinks(hop, { outbound: true });

        var linkLookup = {};
        
        var inboundHops = _.map(inboundLinks, function(link) {

            var inboundHop = hostGraph.getCell(link.get('source').id);
            linkLookup[inboundHop.get('ip') + '->' + hop.get('ip')] = link;
            return inboundHop;
        });
        var outboundHops = _.map(outboundLinks, function(link) {

            var outboundHop = hostGraph.getCell(link.get('target').id);
            linkLookup[hop.get('ip') + '->' + outboundHop.get('ip')] = link;
            return outboundHop;
        });

        // Create middle hop.
        // ------------------

        var clonedHop = hop.clone();
        clonedHop.resize(hop.get('size').width * 2, hop.get('size').height * 2);
        clonedHop.set('position', { x: this.options.width/2 - clonedHop.get('size').width/2, y: 50 });
        clonedHop.attr('circle/stroke', '#7F8C8D');
        clonedHop.attr('circle/stroke-width', 2);
        clonedHop.attr('circle/stroke-dasharray', '5,3');
        this.graph.addCell(clonedHop);

        // Create inbound hops.
        // --------------------
        
        var inboundY = 30;
        var inboundVisitsTotal = 0;
        var inboundClonedHops = [];
        
        _.each(inboundHops, function(inboundHop) {

            var clonedInboundHop = inboundHop.clone();
            inboundClonedHops.push(clonedInboundHop);
            clonedInboundHop.set('rank','min');
            clonedInboundHop.resize(inboundHop.get('size').width * 2, inboundHop.get('size').height * 2);
            inboundY += clonedInboundHop.get('size').height * 2;

            inboundVisitsTotal += clonedInboundHop.get('visits') || 0;

            var link = this.makeLink(clonedInboundHop, clonedHop, linkLookup[inboundHop.get('ip') + '->' + hop.get('ip')]);

            this.graph.addCells([clonedInboundHop, link]);
            
        }, this);

        // Compute percentages each inbound hop was seen.
        _.each(inboundClonedHops, function(hop) {

            hop.attr('.visits/text', (100 * ((hop.get('visits') || 0) / inboundVisitsTotal)).toFixed(1) + '%');
        });

        // Create outbound hops.
        // --------------------
        
        var outboundY = 30;
        var outboundVisitsTotal = 0;
        var outboundClonedHops = [];
        
        _.each(outboundHops, function(outboundHop) {

            var clonedOutboundHop = outboundHop.clone();
            outboundClonedHops.push(clonedOutboundHop);
            clonedOutboundHop.resize(outboundHop.get('size').width * 2, outboundHop.get('size').height * 2);
            clonedOutboundHop.set('rank', 'max');
            outboundY += clonedOutboundHop.get('size').height * 2;

            outboundVisitsTotal += clonedOutboundHop.get('visits') || 0;

            var link = this.makeLink(clonedOutboundHop, clonedHop, linkLookup[hop.get('ip') + '->' + outboundHop.get('ip')]);

            this.graph.addCells([clonedOutboundHop, link]);
            
        }, this);

        // Compute percentages each inbound hop was seen.
        _.each(outboundClonedHops, function(hop) {

            hop.attr('.visits/text', (100 * ((hop.get('visits') || 0) / outboundVisitsTotal)).toFixed(1) + '%');
        });

        // Layout graph.
        // -------------

        var layoutGraph = joint.layout.DirectedGraph.layout(this.graph, {
            setLinkVertices: false,
            rankDir: 'LR',
            //debugLevel: 1,
            rankSep: 80,
            nodeSep: 30
        });
        var padding = 20;
        this.paper.setDimensions(this.options.width + padding, Math.max(inboundY, outboundY));
        V(this.paper.viewport).attr('transform', 'translate(' + padding + ',' + padding + ')');

        // Render history table.
        _.each(hop.get('traceroutes'), function(tracerouteIndex) {

            var traceroute = this.options.graph.get('traceroutes')[tracerouteIndex];

            var currHop = _.findWhere(traceroute.hops, { hop_ip: hop.id });
            var currHopIdx = _.indexOf(traceroute.hops, currHop);
            var prevHop = traceroute.hops[currHopIdx - 1];
            var nextHop = traceroute.hops[currHopIdx + 1];

            var d = new Date;
            d.setTime(traceroute.timestamp_epoch_s * 1000);

            var historyItemTemplate = _.template(this.templateHopHistoryItem);
            this.$history.append(historyItemTemplate({
                time: (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes(),
                prev_hop_ip: prevHop && prevHop.hop_ip,
                prev_hop_as_name: prevHop && prevHop.as_name,
                hop_ip: currHop && currHop.hop_ip,
                hop_as_name: currHop && currHop.as_name,
                next_hop_ip: nextHop && nextHop.hop_ip,
                next_hop_as_name: nextHop && nextHop.as_name
            }));
                
        }, this);
        
        return this;
    },

    makeLink: function(hopA, hopB, originalLink) {

        var link = new joint.dia.Link({
            source: { id: hopA.id, selector: 'circle' },
            target: { id: hopB.id, selector: 'circle' },
            smooth: true,
            attrs: {
                '.connection': {
                    'stroke-width': originalLink.attr('.connection/stroke-width'),
                    stroke: originalLink.attr('.connection/stroke'),
                    'stroke-linecap': 'round'
                }
            },
            latency: hopB.get('latency'),
            z: -1
        });
        return link;
    },

    latencyColor: function(latency) {

	latency = parseFloat(latency);
	if (latency <= .6) return '#27AE60';
	if (latency <= 2) return '#E67E22';
	return '#E74C3C';
    }
});
joint.shapes.traceroutes = {};


joint.shapes.traceroutes.Hop = joint.shapes.basic.Generic.extend({

    markup: '<g class="rotatable"><g class="scalable"><circle/><text class="visits"/></g><text class="ip"/><text class="asn"/></g>',
    
    defaults: joint.util.deepSupplement({
        
        type: 'traceroutes.Hop',
        size: { width: 60, height: 60 },        
        attrs: {
            'circle': { fill: '#FFFFFF', stroke: 'none', r: 30, transform: 'translate(30, 30)' },
            '.ip': { 'font-size': 6, text: '', 'text-anchor': 'middle', 'ref-x': .5, 'ref-y': -16, ref: 'circle', 'y-alignment': 'middle', fill: '#8E44AD', 'font-weight': 'bold', 'font-family': 'Arial, helvetica, sans-serif' },
            '.asn': { 'font-size': 5, text: '', 'text-anchor': 'middle', 'ref-x': .5, 'ref-y': -6, ref: 'circle', 'y-alignment': 'middle', fill: 'black', 'font-family': 'Arial, helvetica, sans-serif' },
            '.visits': { 'font-size': 15, text: '', 'text-anchor': 'middle', fill: 'white', 'font-family': 'Arial, helvetica, sans-serif', transform: 'translate(30, 23)' }
        }
    }, joint.shapes.basic.Generic.prototype.defaults)
});


joint.shapes.traceroutes.HopView = joint.dia.ElementView.extend({

    initialize: function() {

        joint.dia.ElementView.prototype.initialize.apply(this, arguments);

        this.model.on('change:rank change:visits', function() {

            this.updateAttrs();
            this.update();

        }, this);
    },

    updateAttrs: function() {

        var fills = {
            'traceroute/source': '#34495E',
            'traceroute/hop': '#3498DB',
            'traceroute/target': '#2ECC71'
        };
        var fill = fills[this.model.get('mime_type')];
        if (this.model.get('last_hop') && this.model.get('mime_type') !== 'traceroute/target') {
            fill = '#E74C3C';
        }
        
        this.model.attr('circle/fill', fill);
        this.model.attr('.visits/text', this.model.get('visits') || 0);
    },

    render: function() {

        joint.dia.ElementView.prototype.render.apply(this, arguments);
        this.updateAttrs();
        this.update();
    }
});
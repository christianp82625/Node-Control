joint.dia.LightLinkView = joint.dia.ElementView.extend({

    node: V('<g><path class="connection" stroke="gray" fill="none" /><circle class="label-box"/><text class="label"/></g>'),

    initialize: function() {
        
        joint.dia.CellView.prototype.initialize.apply(this, arguments);
        
        V(this.el).attr({ 'class': 'link', 'model-id': this.model.id });
    },
    
    render: function() {

        var node = this.node.clone();

        this._sourceModel = this.paper.getModelById(this.model.get('source').id);
        this._targetModel = this.paper.getModelById(this.model.get('target').id);
        
        this._pathNode = V(node.node.firstChild);
        this._labelNode = V(node.node.lastChild);
        this._labelNode.attr({ fill: 'black', 'text-anchor': 'middle' });
        this._labelBoxNode = V(node.node.children[1]);
        this._labelBoxNode.attr({ fill: 'white', stroke: '#95A5A6', 'stroke-width': 1, r: 5.5 });
        
        this._sourceModel.on('change:position', this.update, this);
        this._targetModel.on('change:position', this.update, this);
        this.model.on('change:vertices', this.update, this);
        
        V(this.el).append(node);

        this.update();
    },

    update: function() {

        // Update attributes.
        _.each(this.model.get('attrs'), function(attrs, selector) {

            var $selected = this.findBySelector(selector);

            var specialAttributes = ['style', 'text'];
            var finalAttributes = _.omit(attrs, specialAttributes);
            $selected.each(function() { V(this).attr(finalAttributes); });
            
            if (!_.isUndefined(attrs.text)) {
                this._labelNode.text(attrs.text + '');
                this._labelNode.attr('display', 'block');
                this._labelBoxNode.attr('display', 'block');
            } else {
                this._labelBoxNode.attr('display', 'none');
                this._labelNode.attr('display', 'none');
            }
            
        }, this);

        var sourcePosition = this._sourceModel.get('position');
        var targetPosition = this._targetModel.get('position');

        if (sourcePosition && targetPosition) {

            var sourceSize = this._sourceModel.get('size');
            var targetSize = this._targetModel.get('size');
            sourcePosition = { x: sourcePosition.x + sourceSize.width/2, y: sourcePosition.y + sourceSize.height/2 };
            targetPosition = { x: targetPosition.x + targetSize.width/2, y: targetPosition.y + targetSize.height/2 };

            var vertices = this.model.get('vertices');

            var d;
            if (this.model.get('smooth')) {

                if (vertices && vertices.length) {
                    d = g.bezier.curveThroughPoints([sourcePosition].concat(vertices || []).concat([targetPosition]));
                } else {
                    // if we have no vertices use a default cubic bezier curve, cubic bezier requires two control points.
                    // the two control points are both defined with X as mid way between the source and target points.
                    // sourceControlPoint Y is equal to sourcePosition Y and targetControlPointY being equal to targetPositionY.
                    // handle situation were sourcePositionX is greater or less then targetPositionX.
                    var controlPointX = (sourcePosition.x < targetPosition.x) 
                        ? targetPosition.x - ((targetPosition.x - sourcePosition.x) / 2)
                        : sourcePosition.x - ((sourcePosition.x - targetPosition.x) / 2);
                    d = ['M', sourcePosition.x, sourcePosition.y, 'C', controlPointX, sourcePosition.y, controlPointX, targetPosition.y, targetPosition.x, targetPosition.y];
                }
                
            } else {
                
                d = ['M', sourcePosition.x, sourcePosition.y];
                _.each(vertices, function(vertex) {
                    d.push(vertex.x, vertex.y);
                });
                d.push(targetPosition.x, targetPosition.y);
            }
            
            this._pathNode.attr('d', d.join(' '));

            var labelPosition = g.point(sourcePosition).move(targetPosition, -g.point(sourcePosition).distance(targetPosition)/2);
            
            this._labelNode.attr({ x: labelPosition.x, y: labelPosition.y + 3 });
            this._labelBoxNode.attr({ cx: labelPosition.x, cy: labelPosition.y  });
        }
    }
});

/**
 * Created by aldo on 11/24/13.
 */
var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , persist_object = require('../helpers/persist')
  , metrics_to_graphite = require('../helpers/metrics_to_graphite')
  , isAuthorized  = require('../helpers/ensure_authenticated')
  , async = require('async');

var ObjectController = new Controller();

ObjectController.create = function() {

  var this_ = this;

  async.series([
    function(callback) {
      persist_object( this_.req.body, this_.app, function(persist) {
        callback(null, persist);
      });
    },
    function(callback) {
      metrics_to_graphite( this_.req.body, this_.app, function(metrics) {
        callback(null, metrics);
      });
    }
  ], function(err, results) {
    this_.res.json(this_.app.stats);
  });

}

// FILTERS
ObjectController.before('create', isAuthorized );


module.exports = ObjectController;



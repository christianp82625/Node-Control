/**
 * Created by aldo on 12/2/13.
 */
/**
 * Created by aldo on 11/24/13.
 */
var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , isAuthorized  = require('../helpers/ensure_authenticated');

var StatController = new Controller();

StatController.index = function() {

  this.res.json(this_.app.stats);

}

//Filters
StatController.before('index', isAuthorized );


module.exports = StatController;



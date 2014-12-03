/**
 * Created by aldo on 3/2/14.
 */
var locomotive = require('locomotive')
  , _ = require('underscore')
  , util = require('util')
  , isAuthorized  = require('../../helpers/ensure_authenticated')
  , Controller = locomotive.Controller
  , winston = require('winston');

var HelpersController = new Controller();

HelpersController.check = function() {

  var this_ = this
    , field = this.params('field')
    , data = this.params('value');

  winston.info(this.req.body);
  winston.info(data);
  winston.info(field);

  var model = field.split(".")[0];
  var field_to_search = field.split(".")[1];
  var Model = require('../../models/' + model);

  winston.info(field_to_search);
//  winston.info(data);

  if(data != undefined) {
    Model.find({})
      .where(field_to_search).equals(data)
      .exec(function (error, result) {
        winston.info('Result ' + result);
        if (error) {
          return this_.res.json(500 , { success: false, error: error });
        } else {
          if (!_.isEmpty(result)) { // exists, it is not unique
            return this_.res.json(200 , { success: true, isUnique: false } );
          } else { // does not exist, it is unique
            return this_.res.json(200 , { success: true, isUnique: true } );
          }
        }
      });
  }

}

// FILTERS
HelpersController.before('check', isAuthorized );

module.exports = HelpersController;



/**
 * Created by aldo on 2/28/14.
 */
var locomotive = require('locomotive')
  , _ = require('underscore')
  , util = require('util')
  , OrganizationLicense = require('../../models/organization_license')
  , isAuthorized  = require('../../helpers/ensure_authenticated')
  , Controller = locomotive.Controller
  , winston = require('winston');

var OrganizationLicensesController = new Controller();

OrganizationLicensesController.index = function() {
  var this_ = this
    , params = this.req;

  winston.debug(this.req);
  Organization.find({}, function (error, organizations) {
    if (error) {
      return this_.res.json(500 , { success: false, error: error });
    } else {
      return this_.res.json(200 , { success: true, data: organizations } );
    }
  })

}

OrganizationLicensesController.create = function() {

  var this_ = this;
  var params = this.req.body;

  console.log(params);
  Organization.create(params, function (error, organization) {
    if (error) {
      console.log(error);
      var msg = '';
      _.each(error, function(message, key) {
        msg += key + ': ' + message + '<br/>';
      });
      return this_.res.json(500 , { success: false, error: error });
    } else {
      return this_.res.json(200 , { success: true, data: organization });
    }
  });

}

OrganizationLicensesController.update = function() {

  var this_ = this;
  var params = this.req.body;

  console.log(params);
  Organization.create(params, function (error, organization) {
    if (error) {
      console.log(error);
      var msg = '';
      _.each(error, function(message, key) {
        msg += key + ': ' + message + '<br/>';
      });
      return this_.res.json(500 , { success: false, error: error });
    } else {
      return this_.res.json(200 , { success: true, data: organization });
    }
  });

}

OrganizationLicensesController.destroy = function() {

  var this_ = this;
  var params = this.req.body;

  console.log(params);
  Organization.create(params, function (error, organization) {
    if (error) {
      console.log(error);
      var msg = '';
      _.each(error, function(message, key) {
        msg += key + ': ' + message + '<br/>';
      });
      return this_.res.json(500 , { success: false, error: error });
    } else {
      return this_.res.json(200 , { success: true, data: organization });
    }
  });

}

// FILTERS
OrganizationLicensesController.before('index', isAuthorized );
OrganizationLicensesController.before('create', isAuthorized );
OrganizationLicensesController.before('update', isAuthorized );
OrganizationLicensesController.before('destroy', isAuthorized );

module.exports = OrganizationLicensesController;



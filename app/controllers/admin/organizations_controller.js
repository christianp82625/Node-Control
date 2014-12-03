/**
 * Created by aldo on 2/28/14.
 */
var locomotive = require('locomotive')
  , _ = require('underscore')
  , util = require('util')
  , Organization = require('../../models/organization')
  , UserOrganization = require('../../models/user_organization')
  , User = require('../../models/user')
  , isAuthorized  = require('../../helpers/ensure_authenticated')
  , Controller = locomotive.Controller;

var OrganizationsController = new Controller();

OrganizationsController.index = function() {
  var this_ = this
    , params = this.req;

  Organization.find({}, function (error, organizations) {
    if (error) {
      return this_.res.json(500, { error: error });
    } else {
      return this_.res.json(200, { data: organizations });
    }
  });

};

OrganizationsController.create = function() {

  var this_ = this;
  var params = this.req.body;

  Organization.create(params, function (error, organization) {
    if (error) {
      console.log(error);
      var msg = '';
      _.each(error, function(message, key) {
        msg += key + ': ' + message + '<br/>';
      });
      return this_.res.json(500 , { error: error });
    } else {
      return this_.res.json(200 , { data: organization });
    }
  });

}

OrganizationsController.update = function() {

  var this_ = this;
  var body = this.req.body;

  delete body._id;
  Organization.update({_id: this_.param('id')}, body, function (error, organization) {
    if (error) {
      var msg = '';
      _.each(error, function(message, key) {
        msg += key + ': ' + message + '<br/>';
      });
      return this_.res.json(500 , { error: error });
    } else {
      return this_.res.json(200 , { data: organization });
    }
  });

}

OrganizationsController.destroy = function() {

  var this_ = this;

  console.log(this.param('id'));
  UserOrganization.find({organization_oid: this_.param('id')}, function (error, user_organizations) {
    console.log(util.inspect(user_organizations));
    if (error) {
      return this_.res.json(500 , { message: error });
    } else {
      if (user_organizations.length > 0) {
        return this_.res.json(500 , { message: 'You cannot delete this organization.'});
      } else {
        Organization.findOneAndRemove({_id: this_.param('id') }, function (error) {
          if (error) {
            console.log(error);
            var msg = '';
            _.each(error, function(message, key) {
              msg += key + ': ' + message + '<br/>';
            });
            return this_.res.json(500 , { message: 'Error deleting Organization.' });
          } else {
            return this_.res.json(200 , { message: 'Organization has been deleted.'});
          }
        });
      }
    }
  })

}

// FILTERS
OrganizationsController.before('index', isAuthorized );
OrganizationsController.before('create', isAuthorized );
OrganizationsController.before('update', isAuthorized );
OrganizationsController.before('destroy', isAuthorized );

module.exports = OrganizationsController;



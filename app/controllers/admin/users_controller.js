/**
 * Created by aldo on 2/28/14.
 */
var locomotive = require('locomotive')
  , _ = require('underscore')
  , util = require('util')
  , User = require('../../models/user')
  , UserOrganization = require('../../models/user_organization')
  , isAuthorized  = require('../../helpers/ensure_authenticated')
  , Controller = locomotive.Controller
  , winston = require('winston');

var UsersController = new Controller();

UsersController.index = function() {
  var this_ = this
    , params = this.req;

  winston.debug(this.req);
  User.find({}, function (error, users) {
    if (error) {
      return this_.res.json(500 , { success: false, error: error });
    } else {
      return this_.res.json(200 , { success: true, data: users } );
    }
  })

}

UsersController.create = function() {

  var this_ = this;
  var params = this.req.body;

  console.log(params);

  params.user_password_sha256 = User.encryptPassword(params.user_password);
  delete params.user_password;

  console.log(params);

  User.create(params, function (error, user) {
    if (error) {
      console.log(error);
      var msg = '';
      _.each(error, function(message, key) {
        msg += key + ': ' + message + '<br/>';
      });
      return this_.res.json(500 , { success: false, error: error });
    } else {
      return this_.res.json(200 , { success: true, data: user });
    }
  });

};

UsersController.update = function() {

  var this_ = this;
  var body = this.req.body;

  delete body._id;
  User.update({_id: this_.param('id')}, body, function (error, user) {
    if (error) {
      var msg = '';
      _.each(error, function(message, key) {
        msg += key + ': ' + message + '<br/>';
      });
      return this_.res.json(500 , { error: error });
    } else {
      return this_.res.json(200 , { data: user });
    }
  });

};

UsersController.destroy = function() {

  var this_ = this;

  console.log(this.param('id'));
  UserOrganization.find({user_oid: this_.param('id')}, function (error, user_organizations) {
    console.log(util.inspect(user_organizations));
    if (error) {
      return this_.res.json(500 , { message: error });
    } else {
      if (user_organizations.length > 0) {
        return this_.res.json(500 , { message: 'You cannot delete this user.'});
      } else {
        User.findOneAndRemove({_id: this_.param('id') }, function (error) {
          if (error) {
            console.log(error);
            var msg = '';
            _.each(error, function(message, key) {
              msg += key + ': ' + message + '<br/>';
            });
            return this_.res.json(500 , { message: 'Error deleting User.' });
          } else {
            return this_.res.json(200 , { message: 'User has been deleted.'});
          }
        });
      }
    }
  })

}

// FILTERS
UsersController.before('index', isAuthorized );
UsersController.before('create', isAuthorized );
UsersController.before('update', isAuthorized );
UsersController.before('destroy', isAuthorized );

module.exports = UsersController;



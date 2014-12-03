/**
 * Created by aldo on 11/23/13.
 */
var passport = require('passport')
  , locomotive = require('locomotive')
  , _ = require('underscore')
  , util = require('util')
  , User = require('../models/user')
  , generateResponse  = require('../helpers/responseGenerator')
  , isAuthorized  = require('../helpers/ensure_authenticated')
  , Controller = locomotive.Controller
  , saveAudit = require('../helpers/save_audit');

var AccountController = new Controller();

AccountController.login = function() {
  var this_ = this;
  var password = this.params('password')
    , params = this.req.body;

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return saveAudit(this_.req, params, 'browser', 'login unsuccessful').then(function() {
        next(err);
      });
    }
    if (!user) {
      return saveAudit(this_.req, params, 'browser', 'login unsuccessful').then(function() {
        this_.res.json(generateResponse(false, info.message , null));
      });
    } else {
      this_.req.logIn(user, function(err){
        if (err) {
          return saveAudit(this_.req, params, 'browser', 'login unsuccessful').then(function() {
            next(err);
          })
        }
        return saveAudit(this_.req, params, 'browser', 'login successful').then(function() {
          this_.res.json(generateResponse(true, 'Welcome to Redwolf Security dashboard.' , { user: user } ));
        })
      });
    }
  })(this.__req, this.__res, this.__next);
}

AccountController.logout = function () {

  var this_ = this

  if (this_.req.isAuthenticated()) {
    var params  = {
      username: this_.req.user.user_contact_email
    };

    return saveAudit(this_.req, params, 'browser', 'logout successful').then(function() {
      this_.req.logout();
      this_.res.json(generateResponse(true, 'Good bye!' , null));
    });
  } else {
    this_.res.json(generateResponse(true, 'Good bye!' , null));
  }
}

AccountController.getUser = function () {

    this.res.json(generateResponse(true,  'Logged In' , { user: this.req.user } ));

}

AccountController.create = function() {

  var this_ = this;
  var params = this.req.body;

  User.create(params)
    .success(function(user) {
      if (!user)
        return this_.res.json(generateResponse(false, 'Error creating user.' , null));

      this_.req.logIn(user, function(err) {
        if (err) {
          return this_.res.json(generateResponse(false, 'Error creating user.' , { err: err } ));
        }
        return this_.res.json(generateResponse(true, 'Welcome' , { user: user } ));
      });

    })
    .error(function(error) {
      if (error) {
        var msg = '';
        _.each(error, function(message, key) {
          msg += key + ': ' + message + '<br/>';
        });
        return this_.res.json(generateResponse(false, msg , { error: error } ));
      }
    });

}


// FILTERS
//AccountController.before('logout', isAuthorized );
AccountController.before('getUser', isAuthorized );
AccountController.before('create', isAuthorized );

module.exports = AccountController;



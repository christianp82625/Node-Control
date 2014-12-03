/**
 * Created by aldo on 12/3/13.
 */
var auth = require('basic-auth')
  , User = require('../models/user')
  , UserOrganization = require('../models/user_organization')
  , Organization = require('../models/organization')
  , _ = require('underscore')
  , crypto = require('crypto')
  , conf  = require('../../conf')
  , moment = require('moment')
  , util = require('util')
  , generateResponse  = require('./responseGenerator')
  , saveAudit = require('./save_audit');

module.exports = ensureAuthenticated = function (req, res, next) {

  var self = this;

  if ( auth(req) !== undefined ) { // CURL API

      var user = auth(req)
      , params = {
        username: user.name,
        password: user.pass
      };

    User.findOne({ user_contact_email: params.username }, function (err, user) {

      if (err) {  // Error finding USER
        console.log('Error finding user ' + err);
        return saveAudit(req, params, 'api', 'login unsuccessful').then(function() {
          res.json([]);
        });
      }

      if (!user) { // username does not exist.
        console.log('Error finding user. Username :' + params.username);
        return saveAudit(req, params, 'api', 'login unsuccessful').then(function() {
          res.json([]);
        });
      }

      if (!user.authenticate(params.password)) { // Password does not match
        console.log('Invalid password. Username :' + params.username);
        return saveAudit(req, params, 'api', 'login unsuccessful').then(function() {
          res.json([]);
        });
      }

      if (!user.isEnabled()) { // Account enabled ?
        console.log('Account disabled. Username :' + params.username);
        return saveAudit(req, params, 'api', 'account disabled').then(function() {
          res.json([]);
        });
      }

      UserOrganization.find({user_oid: user._id}, function (err, user_org) {
        if (err || _.isEmpty(user_org)) {
          return saveAudit(req, params, 'api', 'User does not belong to any Organization.').then(function() {
            res.json([]);
          });
        } else {
          Organization.hasActiveLicense(user_org[0].organization_oid.toString(), function (err, org_license) {
            if (err || _.isEmpty(org_license)) {
              return saveAudit(req, params, 'api', 'User belongs to inactive Organization.').then(function() {
                res.json([]);
              });
            } else {
              var current_date =  Math.round(moment());
              if ( moment(current_date).isBefore(user.license_start_epoch_s * 1000) ) {
                return saveAudit(req, params, 'api', 'login unsuccessful. License has not started yet.').then(function() {
                  res.json([]);
                });
              }
              if ( moment(current_date).isAfter(user.license_end_epoch_s * 1000)) {
                return saveAudit(req, params, 'api', 'login unsuccessful. License expired.').then(function() {
                  res.json([]);
                });
              }
            }
          })
        }
      });

      //  REDIS SESSION - Was already authenticated ?
      self.app.rs.get({
        app: self.app.rsapp,
        token: user.curl_token_session
      }, function(err, resp) {
        if ( !_.isEmpty(resp) ) { // YES
          console.log('Already authenticated ' + params.username);
          return next();
        } else { // NO - Create new session
          console.log('Create new session for ' + params.username);
          self.app.rs.create({
            app: self.app.rsapp,
            id:  crypto.createHmac('sha256', conf.salt).update(params.username).digest('hex'),
//            ip:  req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            ip:  '192.168.1.1', // same for all.
            ttl: 7200000 // Session timeout
          }, function(err, resp) {
            console.log('Error creating Redis session ' + err);
            // resp should be something like
            // {token: "r30kKwv3sA6ExrJ9OmLSm4Wo3nt9MQA1yG94wn6ByFbNrVWhcwAyOM7Zhfxqh8fe"}
            user.curl_token_session = resp.token;
            user.save(function(err) {
              console.log(util.inspect(err));
              return next();
            })
          });
        }
      });
    });
  } else {
    if (!req.isAuthenticated()) { // BROWSER
      return res.json(generateResponse(false, 'Not Logged In' , null));
    } else {
      next();
    }
  }

}

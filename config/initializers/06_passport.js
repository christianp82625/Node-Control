/**
 * Created by aldo on 11/23/13.
 */
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , User = require('../../app/models/user')
  , UserOrganization = require('../../app/models/user_organization')
  , OrganizationLicense = require('../../app/models/organization_license')
  , Organization = require('../../app/models/organization')
  , util = require('util')
  , _ = require('lodash')
  , moment = require('moment');

module.exports = function() {

  var SALT_WORK_FACTOR = 10;

  // Sessions and Such
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id}, function(err, user) {
      if (err) { return err };
      done(err, user);
    });
  });

  passport.use(new LocalStrategy({
//      usernameField: 'email'
//    , passwordField: 'password'
    }, function(username, password, done) {
      User.findOne({ user_contact_email: username }, function (err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false, { message: 'Invalid email or password.' });
        }

        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Invalid email or password.' });
        }

        if (!user.isEnabled()) { // Account enabled ?
          return done(null, false, { message: 'Sorry this account is currently disabled.' });
        }

        UserOrganization.find({user_oid: user._id}, function (err, user_org) {
          if (err || _.isEmpty(user_org)) {
            return done(null, false, { message: 'User does not belong to any Organization.' });
          } else {
//            console.log('User Organization: ' + util.inspect(user_org));
            Organization.hasActiveLicense(user_org[0].organization_oid.toString(), function (err, org_license) {
              if (err || _.isEmpty(org_license)) {
                return done(null, false, { message: 'User belongs to inactive Organization.' });
              } else {
//              console.log('Active Organization License: ' + util.inspect(org_license));
                var current_date =  Math.round(moment());
                if ( moment(current_date).isBefore(user.license_start_epoch_s * 1000) ) {
                  return done(null, false, { message: 'Account will be activated in ' + moment(user.license_start_epoch_s * 1000).diff(current_date,'days') + ' days' });
                }
                if ( moment(current_date).isAfter(user.license_end_epoch_s * 1000)) {
                  return done(null, false, { message: 'Account expired on ' + moment(user.license_end_epoch_s * 1000).format('M/D/YY H:mm:ss A') });
                }
                return done(null, user);
              }
            });
          }
        });
      });
    }
  ));

}


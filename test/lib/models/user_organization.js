/**
 * Created by aldo on 12/20/13.
 */
var _ = require('underscore')
  , moment = require('moment')
  , UserOrganization = require('../../../app/models/user_organization');

module.exports = user = function() {

  var based_user = {
    mime_type:  "access_control/account",
    uri_template : "/users/[user_contact_email]",
    account_created_epoch_time_s : Math.round(Date.now()/1000),
    user_timezone : 'EDT',
    address: {
      mime_type : "access_control/address",
        unit : "4",
        building : "",
        street : "Dupont St.",
        city : "Waterloo",
        state_or_province : "Ontario",
        country : "Canada",
        postal_code : "N2L 2X5"
    }
  }

  var _create = function(organization
    , user_contact_name_first
    , user_contact_name_last
    , user_contact_email
    , password
    , license_start_epoch_s
    , license_end_epoch_s
    , account_enable, success, fail){

    based_user['account_enable'] = account_enable;
    based_user['organization'] = organization;
    based_user['user_contact_name_first'] = user_contact_name_first;
    based_user['user_contact_name_last'] = user_contact_name_last;
    based_user['user_contact_email'] = user_contact_email;
    based_user['uri'] = "/users/" + user_contact_email;
    based_user['license_start_epoch_s'] = license_start_epoch_s;
    based_user['license_end_epoch_s'] = license_end_epoch_s;

    var user = new User(based_user);
    user.user_password_sha256 = user.encryptPassword(password);
    user.save(function(err){
      if(err){
        fail(err);
      }else{
        success(user);
      }
    });
  }

  var _findByEmail = function(email, success, fail){
    User.findOne({user_contact_email:email}, function(e, doc){
      if(e){
        fail(e)
      }else{
        success(doc);
      }
    });
  }

  var _authenticate = function(email, password, success, fail){
    User.findOne({'user_contact_email': email }, function(e, user){
      if(e){
        fail(e)
      } else {
        if (user.authenticate(password)) {
          success(user);
        } else {
          fail(null, false, { message: 'Invalid email or password.' });
        }
      }
    });
  }

  return {
    model : User,
    findByEmail : _findByEmail,
    authenticate: _authenticate,
    create : _create
  }

}();
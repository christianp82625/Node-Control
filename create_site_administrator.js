/**
 * Created by aldo on 12/17/13.
 */
var prompt = require('prompt')
  , moment = require('moment')
  , conf   = require('./conf')
  , crypto = require('crypto')
  , util   = require('util')
  , User = require('./app/models/user')
  , Organization = require('./app/models/organization')
  , UserOrganization = require('./app/models/user_organization')
  , OrganizationLicense = require('./app/models/organization_license')
  , mongoose = require('mongoose')
  , _ = require('underscore');

  console.log(conf.mongo_database_url);
  mongoose.connect(conf.mongo_database_url);

  var user = {
      account_created_epoch_time_s : Math.round(Date.now()/1000),
      user_timezone : 'EDT',
      account_enable : true,
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

  var org = {
    address: {
      mime_type: "access_control/address",
      unit : "4",
      building : "",
      street1 : "Dupont St.",
      street2 : "Dupont St.",
      city : "Waterloo",
      region : "Ontario",
      country : "Canada",
      postal_code : "N2L 2X5"
    }
  }


  var user_schema = {
    properties: {
      user_contact_name_first: {
        required: true
      },
      user_contact_name_last: {
        required: true
      },
      user_contact_email: {
        required: true
      },
      password: {
        hidden: true
      }
    }
  };

  var org_schema = {
    properties: {
      organization: {
        required: true
      },
      organization_contact_name_first: {
        required: true
      },
      organization_contact_name_last: {
        required: true
      },
      organization_contact_email: {
        required: true
      }
    }
  };

  var user_org_schema = {
    properties: {
      string_roles: {
        message: "format: site_administrator:true, organization_administrator:false ",
        required: true
      }
    }
  };

  var org_license_schema = {
    properties: {
      license_start: {
        message: "License starts from in days. Could be negative to start days ago ",
        required: true
      },
      license_end: {
        message: "License ends in days ",
        required: true
      },
      license_enabled_value : {
        required: true
      },
      maximum_bandwidth_allowed_gigabits_per_second: {
        required: true
      },
      maximum_agents_allowed_across_all_theatres: {
        required: true
      }
    }
  };

prompt.start();

prompt.get(user_schema, function (err, user_result) {
  user['user_password_sha256'] = crypto.createHmac('sha256', conf.salt).update(user_result.password).digest('hex');
  _.extend(user, _.omit(user_result, 'password'));
  console.log('User data ' + util.inspect(user));
  prompt.get(org_schema, function (err, org_result) {
    _.extend(org, org_result);
    console.log('Org data ' + util.inspect(org));
    prompt.get(user_org_schema, function (err, user_org_results) {
      console.log('User Org data ' + util.inspect(user_org_results));

      //  Saving Roles ----------------------------
      user_org_results.roles = [];
      var properties = user_org_results.string_roles.split(',');
      properties.forEach(function(property) {
        var roles_obj = {};
        var tup = property.split(':');
        roles_obj.role = tup[0];
        roles_obj.hasRole = (tup[1] == "false") != Boolean(tup[1]);
        user_org_results.roles.push(roles_obj);
      });

      //  Saving Roles ----------------------------
      _.extend(user_org_results, _.omit(user_org_results, 'string_roles'));
      prompt.get(org_license_schema, function (err, org_license_results) {
        org_license_results['license_enabled'] = (org_license_results.license_enabled_value == "false") != Boolean(org_license_results.license_enabled_value);
        org_license_results['license_start_epoch_s'] = Math.round(moment().add('days', org_license_results.license_start)/1000)
        org_license_results['license_end_epoch_s'] = Math.round(moment().add('days', org_license_results.license_end)/1000)
        _.extend(org_license_results, _.omit(org_license_results, 'license_start'));
        _.extend(org_license_results, _.omit(org_license_results, 'license_end'));
        _.extend(org_license_results, _.omit(org_license_results, 'license_enabled_value'));
        console.log('Org License data ' + util.inspect(org_license_results));
        Organization.create(org, function (error, organization) {
          if (error) {
            console.log(error);
          } else {
            console.log('Organization created');
            _.extend(org_license_results, { organization_oid: organization._id, organization_name: organization.organization})
            User.create(user, function (error, user) {
              if (error) {
                console.log(error);
              } else {
                console.log('User created');
                UserOrganization.create({ organization_name: org.organization
                                        , organization_oid: organization._id
                                        , user_contact_email: user.user_contact_email
                                        , user_oid: user._id
                                        , roles: user_org_results.roles  }, function (err, user_organization) {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('User Organization created');
                    OrganizationLicense.create(org_license_results, function (error, org_license) {
                      if ( error ) {
                        console.log(error);
                      } else {
                        console.log('Organization License created');
                        console.log('Everything was saved.')
                        return;
                      }
                    })
                  }
                });
              }
            });
          }
        });
      });
    });
  });
});

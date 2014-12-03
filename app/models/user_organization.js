/**
 * Created by aldo on 1/20/14.
 */
var mongoose = require('mongoose')
  , _ = require('lodash')
  , Schema = mongoose.Schema;

var validatePresenceOf = function(value) {
  return value && value.length;
}

var UserOrganization = new Schema({
  mime_type : { type: String, default: "access_control/user_organization_mapping" },
  uri_template : { type: String, default: "/organizations/[organization]/members/[user_contact_email]" },
  uri : { type: String },
  organization_name: { type: String },
  organization_oid : { type: Schema.Types.ObjectId, ref: 'Organization', required: 'Organization Ref is required' },
  user_contact_email: { type: String },
  user_oid: { type:  Schema.Types.ObjectId, ref: 'User', required: 'User Ref is required' },
  roles: [ { type: Schema.Types.Mixed } ]
}, {
  collection: 'user_organizations'
});

// Indexes
UserOrganization.index({ uri: 1 },{ sparse: true, background: false });
UserOrganization.index({ organization_name: 1 });
UserOrganization.index({ user_contact_email: 1 });

UserOrganization.path('organization_name').validate(function (organization_name) {
  return validatePresenceOf(organization_name);
}, 'Organization Name is required');

UserOrganization.path('user_contact_email').validate(function (user_contact_email) {
  return validatePresenceOf(user_contact_email);
}, 'User Email is required');

UserOrganization.pre('save', function(next) {
  this.uri = "/organizations/" + this.organization_name + "/members/" + this.user_contact_email;
  next();
});

// Instance Methods --------------------------------------
UserOrganization.methods.activeRoles = function() {
    return _.filter(this.roles, { 'hasRole':true });
  };

UserOrganization.methods.isRoleActive = function(role) {
  return _.find(this.roles, function (element) {
    return  element.role === role && element.hasRole;
  });
};

UserOrganization.methods.findRole = function(role) {
    return _.find(this.roles, { role: role });
  };


module.exports = mongoose.model('UserOrganization', UserOrganization);
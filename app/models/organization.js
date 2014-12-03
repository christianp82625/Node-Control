/**
 * Created by aldo on 1/20/14.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , moment = require('moment')
  , ObjectId  = mongoose.Types.ObjectId;

var validatePresenceOf = function(value) {
  return value && value.length;
}

var Organization = new Schema({
  mime_type : { type: String, default: "access_control/organization" },
  uri_template : { type: String, default: "/organizations/[organization]" },
  uri : { type: String },
  organization : { type: String },
  organization_contact_name_first : { type: String },
  organization_contact_name_last : { type: String },
  organization_contact_email : { type: String },
  address : {
    mime_type : { type: String, default: "access_control/address" },
    unit : { type: String },
    building : { type: String },
    street1 : { type: String },
    street2 : { type: String },
    city : { type: String },
    region : { type: String },
    country : { type: String },
    postal_code : { type: String }
  }
}, {
  collection: 'organizations'
});

Organization.path('organization').validate(function (organization) {
  return validatePresenceOf(organization);
}, 'Organization is required');

Organization.path('organization_contact_name_first').validate(function (organization_contact_name_first) {
  return validatePresenceOf(organization_contact_name_first);
}, 'Contact First Name is required');

Organization.path('organization_contact_name_last').validate(function (organization_contact_name_last) {
  return validatePresenceOf(organization_contact_name_last);
}, 'Contact Last Name is required');

Organization.path('organization_contact_email').validate(function (organization_contact_email) {
  return validatePresenceOf(organization_contact_email);
}, 'Contact Email is required');


// Indexes
Organization.path('uri').index({ unique: true, sparse: true, background: false });
Organization.index({ organization_contact_email:1 }, { unique: true });
Organization.path('organization_contact_email').index({ unique: true });

Organization.statics.hasActiveLicense = function (orgId, callback) {
  var today = Math.round(moment()/1000);
  this.model('OrganizationLicense')
      .find({ organization_oid: ObjectId(orgId)
            , license_start_epoch_s: { $lte: today }
            , license_end_epoch_s:   { $gte: today } })
      .populate('organization_oid')
      .exec(callback)
},

Organization.pre('save', function(next) {
  this.uri = "/organizations/" + this.organization;
  next();
})

module.exports = mongoose.model('Organization', Organization);
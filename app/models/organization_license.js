/**
 * Created by aldo on 1/20/14.
 */
var mongoose  = require('mongoose')
  , Schema    = mongoose.Schema
  , ObjectId  = mongoose.Types.ObjectId;

var validatePresenceOf = function(value) {
  return value && value.length;
}

var validateInterval = function(start, end) {
  return start < end;
}

var OrganizationLicense = new Schema({
  mime_type: { type: String, default: "access_control/organization_license" },
  uri_template: { type: String, default: "/organizations/[organization]/licenses/[id]" },
  uri: { type: String },
  organization_oid : { type: Schema.Types.ObjectId, ref: 'Organization', required: 'Organization Ref is required' },
  organization_name: { type: String },
  license_start_epoch_s : { type: Number },
  license_end_epoch_s : { type: Number },
  license_enabled: { type: Boolean, default: false },
  purchase_order: { type: String },
  maximum_bandwidth_allowed_gigabits_per_second: { type: Number },
  maximum_agents_allowed_across_all_theatres: { type: Number }
}, {
  collection: 'organization_licenses'
});

OrganizationLicense.path('organization_name').validate(function (organization_name) {
  return validatePresenceOf(organization_name);
}, 'Organization Name is required');

OrganizationLicense.statics.load = function (id, callback) {
    this.findOne({ _id : id })
      .populate('organization_oid')
      .exec(callback);
},

OrganizationLicense.statics.list = function (options, callback) {
    var criteria = options.criteria || {};
    this.find(criteria)
      .populate('organization_oid')
      .sort(options.sort || {'organization_name': 1}) // sort by organization Name
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(callback);
},

OrganizationLicense.pre('save', function(next) {
  if (!validateInterval(this.license_start_epoch_s, this.license_end_epoch_s)) {
    next(new Error('License start should be minor than License end.'));
  } else {
    this.uri = "/organizations/" + this.organization_name + "/licenses/" + this._id;
    next();
  }
});


module.exports = mongoose.model('OrganizationLicense', OrganizationLicense);
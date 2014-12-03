/**
 * Created by aldo on 11/23/13.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , conf   = require('../../conf');

var validatePresenceOf = function(value) {
  return value && value.length;
}

var User = new Schema({
  mime_type : { type: String, default: "access_control/account" },
  uri_template : { type: String, default: "/users/[user_contact_email]" },
  uri : { type: String },
  account_created_epoch_time_s : { type: Number, default: Math.round(Date.now()/1000) },
  user_contact_name_first : { type: String, required: 'First Name is required' },
  user_contact_name_last : { type: String, required: 'Last Name is required' },
  user_contact_email : { type: String, required: 'Email is required' },
  user_password_sha256 : { type: String, required: 'Password is required' },
  user_timezone : { type: String, default: 'EDT' },
  account_enable : { type: Boolean, default: false },
  curl_token_session : { type: String },
  address : {
    mime_type : { type: String, default: "access_control/address" },
    unit : { type: String },
    building : { type: String },
    street : { type: String },
    city : { type: String },
    region : { type: String },
    country : { type: String },
    postal_code : { type: String }
  }
}, {
  collection: 'users'
});

// Indexes
User.path('uri').index({ unique: true, sparse: true, background: false });
User.index({ organization:1 , user_contact_email:1 }, { unique: true });
User.path('user_contact_email').index({ unique: true });

User.methods.authenticate = function(plain){
  return this.constructor.encryptPassword(plain) == this.user_password_sha256;
};

User.methods.isEnabled = function() {
  return this.account_enable;
};

User.methods.userOrganizations = function (cb) {
  return this.model('UserOrganization')
            .find({user_oid: this._id})
            .populate('organization_oid')
            .exec(cb);
};

User.statics.encryptPassword = function (str) {
  return crypto.createHmac('sha256', conf.salt).update(str).digest('hex')
}

User.pre('save', function(next) {
  if (!validatePresenceOf(this.user_password_sha256)) {
    next(new Error('Password cannot be blank'));
  } else {
    this.uri = "/users/" + this.user_contact_email;
    next();
  }
});

module.exports = mongoose.model('User', User);
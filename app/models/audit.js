/**
 * Created by aldo on 11/23/13.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , conf   = require('../../conf')
  , uuid = require('node-uuid');

var validatePresenceOf = function(value) {
  return value && value.length;
}

var Audit = new Schema({
  mime_type : { type: String, default: 'audit/authentication' },
  uri : { type: String },
  timestamp_epoch_s : { type: Number, default: Math.round(Date.now()/1000) },
  ip : { type: String, required: 'Ip is required' },
  user_agent : { type: String, required: 'User Agent is required' },
  attempted_username : { type: String, required: 'Username is required' },
  auth_type : { type: String, required: 'Auth Type is required' },
  attempt: { type: String }
}, {
  collection: 'audits'
});

// Indexes
Audit.path('uri').index({ unique: true, sparse: true, background: false });

Audit.pre('save', function(next){
  this.uri = '/audit/authentication/' + this.attempted_username +'/' + uuid.v1();
  next();
})

module.exports = mongoose.model('Audit', Audit);
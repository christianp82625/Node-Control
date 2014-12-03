/**
 * Created by aldo on 11/21/13.
 */
var conf = require('../../conf.js')
  , RedisSessions = require('redis-sessions');

module.exports = function() {

  this.rs = new RedisSessions();
  this.rsapp = "control"; // App name to identify sessions

}
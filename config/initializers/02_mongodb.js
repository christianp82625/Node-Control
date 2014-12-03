/**
 * Created by aldo on 11/21/13.
 */
var conf = require('../../conf.js');

module.exports = function() {

  this.db = require("mongojs").connect(conf.mongo_database_url, ["event","alert","conf","object"]);

//  console.log(this.db);

// Do this once upon startup to be safe
  this.db.object.ensureIndex({ "mime_type" : 1 });
  this.db.object.ensureIndex({ "uri" : 1 });
  this.db.object.ensureIndex({ "public_ip" : 1 }, {"sparse" : true });
  this.db.object.ensureIndex({ "service_state" : 1 },{"sparse" : true });
  this.db.object.ensureIndex({ "service_name" : 1 },{"sparse" : true });
  this.db.object.ensureIndex({ "state_change_time_epoch_s" : 1 },{"sparse" : true });
  this.db.object.ensureIndex({ "_t" : 1 });

}
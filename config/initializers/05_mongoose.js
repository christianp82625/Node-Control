/**
 * Created by aldo on 11/23/13.
 */
var conf = require('../../conf.js');

module.exports = function() {

  this.mongoose = require('mongoose');
  switch (this.env) {
    case 'development':
      this.mongoose.connect(conf.mongo_database_url);
      break;
    case 'production':
      this.mongoose.connect(conf.mongo_database_url);
      break;
  }

}

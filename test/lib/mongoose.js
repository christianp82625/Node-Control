/**
 * Created by aldo on 1/23/14.
 */
var mongoose = require('mongoose');

module.exports = function () {
  //tell Mongoose to use a different DB - created on the fly
  mongoose.connect('mongodb://localhost/control_test');
}
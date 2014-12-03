/**
 * Created by aldo on 12/16/13.
 */
var Audit = require('../models/audit')
  , q = require('q');

module.exports = saveAudit = function (req, params, type, attempt) {

  var deferred = q.defer();

  var audit = new Audit();

  audit.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  audit.user_agent = req.headers['user-agent'];
  audit.auth_type = type;
  audit.attempted_username = params.username || '';

  audit.attempt = attempt;

  audit.save(function(err) {
    if(err) { deferred.reject(err); }
    console.log('audit saved');
    deferred.resolve();
  });

  return deferred.promise;

}

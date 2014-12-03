/**
 * Created by aldo on 11/23/13.
 */
var conf = require('../../conf');

module.exports = function() {
  console.log('Starting http listeners ( http and https ) ');

  this.httpServer.listen(conf.http_port, function() {
    var addr = this.address();
    console.log('listening on http %s:%d', addr.address, addr.port);
  });

  this.httpsServer.listen(conf.https_port, function() {
    var addr = this.address();
    console.log('listening on https %s:%d', addr.address, addr.port);
  });

}
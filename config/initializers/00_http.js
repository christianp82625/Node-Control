var fs = require('fs')
  , conf = require('../../conf.js')
  , express = require('express')
  , geoip = require('geoip-lite');

module.exports = function() {
  var app = this.express;
      app2 = express();

  var https_options = {
    key: fs.readFileSync( conf.ssl.key_path ),
    cert: fs.readFileSync( conf.ssl.cert_path)
  };

  this.httpServer = require('http').createServer(app2);

  app2.get('/ip', function(req,res) {
    ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    geo = geoip.lookup(ip)
    res.json({ requestor_ip : ip, geo: geo })
    res.end()
  });

  app2.use(express.static('/var/www/'));

  this.httpsServer = require('https').createServer(https_options, app);
}

var express = require('express')
  , poweredBy = require('connect-powered-by')
  , util = require('util')
  , passport = require('passport')
  , conf = require('../../conf.js')
  , RedisStore = require('connect-redis')(express)
  , redis = require("redis").createClient();

var recent_objects = [];

var allowCrossDomain = function (req, res, next) {

  var allowedDomains = [
    'localhost:444',
    'localhost:3001',
    'localhost:3002',
    'control.redwolfsecurity.com',
    'control.redwolfsecurity.com:3001',
    'control.redwolfsecurity.com:3002',
    'control.redwolfsecurity.com:80',
    'control.redwolfsecurity.com:443'
  ]

  if (allowedDomains.indexOf(req.headers.host) != -1 || allowedDomains.indexOf(req.headers.origin) != -1) {
    res.header('Access-Control-Allow-Credentials', true);
    if ( req.headers['access-control-request-method'] !== null ) {
      res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method'])
    }
    res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
    if ( req.headers['access-control-request-headers'] !== null) {
      res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    }
    if ( req.headers.origin !== null ) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
    } else {
      res.header('Access-Control-Allow-Origin', req.headers.host);
    }
  } else {
    console.log('Disallowed host: ' + req.headers.host);
    res.send({'success': false, 'data': '', 'message': 'Disallowed host. Check allowed domains.' });
  }

  if ( 'OPTIONS' == req.method ) {
    res.send(200);
  } else {
    next();
  }
}

module.exports = function() {
  // Warn of version mismatch between global "lcm" binary and local installation
  // of Locomotive.
  //  if (this.version !== require('locomotive').version) {
  //    console.warn(util.format('version mismatch between local (%s) and global (%s) Locomotive module', require('locomotive').version, this.version));
  //  }

  // Configure application settings.  Consult the Express API Reference for a
  // list of the available [settings](http://expressjs.com/api.html#app-settings).
  this.set('views', __dirname + '/../../app/views');
  this.set('view engine', 'ejs');

  // Register EJS as a template engine.
  this.engine('ejs', require('ejs').__express);

  // Override default template extension.  By default, Locomotive finds
  // templates using the `name.format.engine` convention, for example
  // `index.html.ejs`  For some template engines, such as Jade, that find
  // layouts using a `layout.engine` notation, this results in mixed conventions
  // that can cuase confusion.  If this occurs, you can map an explicit
  // extension to a format.
  /* this.format('html', { extension: '.jade' }) */

  // Register formats for content negotiation.  Using content negotiation,
  // different formats can be served as needed by different clients.  For
  // example, a browser is sent an HTML response, while an API client is sent a
  // JSON or XML response.
  /* this.format('xml', { engine: 'xmlb' }); */

  // Use middleware.  Standard [Connect](http://www.senchalabs.org/connect/)
  // middleware is built-in, with additional [third-party](https://github.com/senchalabs/connect/wiki)
  // middleware available as separate modules.
  this.use(poweredBy('Locomotive'));
  this.use(express.compress());

  this.use(express.favicon());
  this.use(express.static(__dirname + '/../../public/app'));
  this.use(express.static(__dirname + '/../../public/app/scripts'));
//  this.use(express.bodyParser()); // this was replaced in Express 3.0 by next 2 lines.
  this.use(express.json());
  this.use(express.urlencoded());
  this.use(express.cookieParser());
  this.use(express.methodOverride());
  this.use( allowCrossDomain );
  this.use(express.session({
    secret: conf.salt,
    cookie: { secure: false, maxAge:86400000 },
    store: new RedisStore({
      host: conf.redis_url,
      port: conf.redis_port,
      client: redis
    })
  }));
  this.use(passport.initialize());
  this.use(passport.session());
  this.use(this.router);

//  this.use(function(req, res, next){
//    res.status(404);
//
//    // respond with html page
//    if (req.accepts('html')) {
//      res.render('404', { url: req.url });
//      return;
//    }
//
//    // respond with json
//    if (req.accepts('json')) {
//      res.send({ error: 'Not found' });
//      return;
//    }
//
//    // default to plain-text. send()
//    res.type('txt').send('Not found');
//  });

//  this.use(function(err, req, res, next){
//    // we may use properties of the error object
//    // here and next(err) appropriately, or if
//    // we possibly recovered from the error, simply next().
//    res.status(err.status || 500);
//    res.render('500', { error: err });
//  });

}

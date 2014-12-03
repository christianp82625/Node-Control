// RedWolf Security DataServer
var os = require("os"),
util = require('util');

// For Posix MQ
var PosixMQ = require('pmq');
var readbuf, mq;
mq = new PosixMQ();


var hostname = os.hostname();

var redwolf_control_conf = require('./conf.js')

var https_port = redwolf_control_conf.https_port;
var http_port = redwolf_control_conf.http_port;
var graphite_server = redwolf_control_conf.graphite_server;
var graphite_server_port = redwolf_control_conf.graphite_server_port;
var carbon_server = redwolf_control_conf.carbon_server;
var carbon_server_port = redwolf_control_conf.carbon_server_port;
var databaseUrl = redwolf_control_conf.mongo_database_url;

var debug = redwolf_control_conf.debug;
var collectors = redwolf_control_conf.collectors;


var fs = require('fs');
var net = require('net');
var express = require('express');
var http = require('http')
var https = require('https')
var url = require('url')
var app = express()

//var server = http.createServer(app)
//var io = require('socket.io').listen(server, { log: false })

var geoip = require('geoip-lite');
var recent_objects = []; 

// Active Directory Authentication
/*
var config = {
    realm: 'http://localhost:3000',
    _identityProviderUrl: 'https://login.windows.net/ad0ffc54-96b9-4757-bbb0-fcc293e2f4aa/wsfed',
    identityProviderUrl: 'https://login.windows.net/159a78f1-47ef-43f9-b823-ccb5858cc8ad/wsfed',
    identityMetadata: 'https://login.windows.net/159a78f1-47ef-43f9-b823-ccb5858cc8ad/FederationMetadata/2007-06/FederationMetadata.xml'
                };

    var wsfedStrategy = new wsfedsaml2(config,
        function(profile, done) {
        if (!profile.email) {
        return done(new Error("No email found"), null);
        }
        // asynchronous verification, for effect...
        process.nextTick(function () {
        findByEmail(profile.email, function(err, user) {
            if (err) {
            return done(err);
            }
            if (!user) {
            // "Auto-registration"
            users.push(profile);
            return done(null, profile);
            }
            return done(null, user);
        });
        });
    });


    passport.use(wsfedStrategy);

    var users = [];

    function findByEmail(email, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.email === email) {
    return fn(null, user);
    }
    }
    return fn(null, null);
    }
*/

app.use(express.bodyParser());
//app.use(express.basicAuth( authorize ));
//app.use(express.basicAuth( redwolf_control_conf.httpauth_user, redwolf_control_conf.httpauth_password ));
app.use(express.static(__dirname + '/static'));
app.use(app.router);



/*
app.post('/login/callback',
	passport.authenticate('wsfed-saml2', { failureRedirect: '/', failureFlash: true }),
	function(req, res) {
	res.redirect('/');
	});
*/


var https_options = {
		key: fs.readFileSync( redwolf_control_conf.ssl.key_path ),
		cert: fs.readFileSync( redwolf_control_conf.ssl.cert_path),
};

var server = https.createServer(https_options, app);
var server2 = http.createServer(app);

var io = require('socket.io').listen(server, { log: false });

var collections = ["event","alert","conf","object"];
var db = require("mongojs").connect(databaseUrl, collections);

// Do this once upon startup to be safe
db.object.ensureIndex({ "mime_type" : 1 });
db.object.ensureIndex({ "uri" : 1 });
db.object.ensureIndex({ "public_ip" : 1 }, {"sparse" : true });
db.object.ensureIndex({ "service_state" : 1 },{"sparse" : true });
db.object.ensureIndex({ "service_name" : 1 },{"sparse" : true });
db.object.ensureIndex({ "state_change_time_epoch_s" : 1 },{"sparse" : true });
db.object.ensureIndex({ "_t" : 1 });

var config = { allowedDomains : "control.redwolfsecurity.com" }
//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', config.allowedDomains);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.configure(function() {
    app.use(allowCrossDomain);
});


// Open a socket to Graphite
var client = {};

function setupCarbonConnection( ) {
	console.log("Attempting to connect to carbon ip=" + carbon_server + " port=" + carbon_server_port )
	client = net.connect( carbon_server_port, carbon_server, function () { } );

	client.on('connect', function () {
		client.setKeepAlive(true,1000);
		console.info( "server: STARTUP -- CARBON: Connected to " + carbon_server + " on port " + carbon_server_port );
	});

	client.on('error', function(err) {
		console.error('CARBON: Socket error:', err.message);
		//client.destroy();
		setTimeout(setupCarbonConnection, 10000); //Try to reconnect
		//client = net.connect( carbon_server_port , carbon_server );
	});

	client.on('close', function(err) {
		console.error('CARBON: Socket close:', err.message);
		setTimeout(setupCarbonConnection, 10000); //Try to reconnect
	});

	client.on('timeout', function(err) {
		console.error('CARBON: Socket error:', err.message);
		setTimeout(setupCarbonConnection, 10000); //Try to reconnect
		//client = net.connect( carbon_server_port , carbon_server );
	});
}


setupCarbonConnection()

var stats = {
  mime_type : "application/statistics",
  time_started_epoch : (new Date()).getTime(),
  message_count : 0,
  message_count_pmq : 0,
  message_count_http : 0,
  message_error_count : 0,
  message_error_http_count : 0,
  message_error_pmq_count : 0,
  db_query_count : 0,
  object_count : 0,
  object_client_push_count : 0,
  object_save_error : 0,
  metrics_saved : 0
}

//app.use(express.basicAuth('redwolf', 'bigtest!'));

function authorize(username, password) {
    if (username == "redwolf") {
       return 'bigtest!' === password
    }
    if (username == "paulsop") {
       return 'isaniceguy' === password
    }
    return false
}

app.use(express.basicAuth(authorize));


function query_db(req,res) {

    stats.db_query_count++;
    //	var query_string = JSON.stringify(req.query, null, '\t');
    var query = req.query;
    var objects_returned = null;
    var delimiter = ':';

    // Note: req.query uses express's json parsing middleware, but integers are converted to strings
    // So let's iterate over the req.query parameters and if it looks like a #, make it a #
    // Otherwise you can't query for #'s in MongoDB. i.e. "123" != 123
    // Javascript casts strings as #'s in subtraction, so that's how we'll do the test.
    for (var key in query) {
	var val = query[key];

	if (!isNaN(+val)) {

	    query[key] = +val

	} else if (val === "true" || val === "false") {

	    // Also handle true/false case
	    query[key] = (val === "true")

	} else if (/^\/.+\/$/.test(val)) {

	    try {
		var input = val.slice(1, val.length - 1).replace(/([()[{*+.\\?])/g, '\\$1');// keep only ^,$,|
		query[key] = new RegExp(input,'i');
	    } catch (e) {
		delete query[key];
	    }

	}

	if (key.indexOf(delimiter) > -1) {

	    var keys = key.split(delimiter);
	    var k, previous, current = query;

	    for (var i in keys) {
		k = keys[i];
		previous = current;
		current = current[k] = current[k] || (['$and','$or','$not','$nor','$nin'].indexOf(k) < 0 ? {} : []);
	    }

	    previous[k] = query[key];
	    delete query[key];
	}

    }

    console.log('1:',query);
    console.log('2:',JSON.stringify(query));

    var cursor = db.object.find(query, {}, { limit : 1000 }, function(err, objects) {
	if ( err || !objects) {
	    res.setHeader('Content-Type', 'application/json');
	    res.json({"error" : "No objects match", "error_code" : 404});
	    res.end();
	}
	else {
	    objects_returned = objects;
	    res.setHeader('Content-Type', 'application/json');
	    //res.json(objects_returned);
	    res.send(JSON.stringify(objects, null, 2));
	    res.end();
	}
    });
}

function persist( object ) {
	// Add our own timestamp to all objects
	object["_t"] = Math.floor((new Date()).getTime()/1000);

	// broadcast( object )

	// Is this a message? Handle it like a message.
	if ( object.mime_type == "delivery/message" ) {
		stats.message_count++;;
		stats.message_count_http++;;
		object.payload.forEach( function( payload ) { persist( payload ) } );
	} else {
		db.object.update({ 'uri' : object.uri }, object, { 'upsert' : true }, function(err, updated) {
			if ( err | !updated ) {
				if (debug) { console.log('server -- Object not updated in Mongo'); }
				console.log("Object Stored!")
				console.log(object)
				stats.object_save_error++;
			} else {
				//if (debug) { console.log('server -- Object updated'); }
				stats.object_count++;
			} // if err
		}); // db.object.save()
	} // if mime_type
} // persist()

// Get recent agents
function query_agents_active(req,res) {
  stats.db_query_count++;
  var query = JSON.stringify(req.query, null, '\t');
  var query = req.query;
  var objects_returned = null;
  last_n_seconds = 7 * 60; // 7 minutes
  active_since = Math.floor((new Date()).getTime()/1000)-last_n_seconds;
  query.mime_type = "agent/registration";
  query._t = {$gt: active_since};

  var cursor = db.object.find(query, {}, { limit: 5000 }, function(err, objects) {
    if ( err || !objects) {
        res.setHeader('Content-Type', 'application/json');
        res.json({"error" : "No objects match", "error_code" : 404});
        res.end();
    }
    else {
      objects_returned = objects
      res.setHeader('Content-Type', 'application/json');
      res.json(objects_returned);
      res.end();
    }
  });
};

function metrics_to_graphite(object) {
  // Send Metrics to Graphite
 if ( object.mime_type == "delivery/message" ) {
                 object.payload.forEach( function( payload ) { metrics_to_graphite( payload ) } );
 }

    if ( object.hasOwnProperty("mime_type") ){
      if ( object.mime_type == "agent/stats" ) {
        re=/\./g 
        ip = object.public_ip.replace(re , "_")
        metric_base_name = "agents." + object.agent_region + "." + ip + ".";
        utcSeconds = object.current_timestamp_s;

        metrics = [
	  "loadavg_1minute",
	  "loadavg_5minutes",
	  "loadavg_15minutes",
	  "net_rx_bytes",
	  "net_tx_bytes",
	  "net_tx_packets",
	  "net_rx_packets",
	  "net_rx_bytes_delta",
	  "net_tx_bytes_delta",
	  "net_tx_packets_delta",
	  "net_rx_packets_delta",
	  "cpu_load_percent" ]

        metrics.forEach( function(metric) {
          stats.metrics_saved += 1
          metric_name = metric_base_name + metric
          metric_value = object[metric]
          client.write( metric_name + " " + metric_value + " " + utcSeconds + "\n");
        });
        //utcSeconds=Math.floor((new Date()).getTime()/1000)
      }
    }
}

function broadcast (object) {
	io.sockets.emit('object_push', object );
        stats.object_client_push_count++
}

function store_posted_object(req,res) {
	persist(req.body);
	metrics_to_graphite( req.body );
	res.setHeader('Content-Type', 'application/json');
	//if (debug) { console.log("server -- Post Received") }
	//if (debug) { console.log(req.body) }
	res.json(stats);
	res.end();
}

// Handle reading from local message queue
mq.on('messages', function() {
        var readbuf = new Buffer(mq.msgsize);
	var n;
	while ((n = this.shift(readbuf)) !== false) {
		console.log("Reading Message from PosixMQ")
		stats.message_count++
		stats.message_count_pmq++
                //json_object = JSON.parse(readbuf.toString('utf8', 0, n))
		try {
                	eval("json_object = " + readbuf.toString('utf8', 0, n))
			console.log("Received object from PosixMQ")
			console.log(json_object)
			//broadcast(json_object)
			//persist(json_object)
		} catch (err) {
			console.log("Error: Message formatting error.")
			stats.message_error_count++
			stats.message_error_pmq_count++
		}
		message_bytes = n;
		messages_left = this.curmsgs;
	}
});
mq.open({ name: '/redwolf_deliver', create: true, mode: '0777' });
console.log("Listening: POSIX Message Queue /redwolf_deliver")

// Handle posting for new data and store it in the database
app.post('/',function(req,res){store_posted_object(req,res)});

// Handle Web Socket Connections
io.sockets.on('connection', function (socket) {
        console.log("WebSocket Connected");
	socket.emit('object_push', { "mime_type" : "console/log", "message" : "Welcome to the update feed." });
	socket.emit('object_push', {
		"mime_type" : "config/hosts", 
		"hostname" : hostname,
		"graphite_server" : graphite_server,
		"graphite_server_port" : graphite_server_port });
		socket.on('object_push_confirm', function (data) {
		if (debug) { console.log(data); }
	});
	socket.on('object_push', function(data) {
   		console.log("Received object from browser:")
 		//mq.push(new Buffer(data))
		if (data.mime_type == "command/unix") { console.log("Running command!") }
   		console.log(data)
	})
});



// Handle posting for new data and store it in the database
app.post('/',function(req,res){ req.setSocketKeepAlive(100000); store_posted_object(req,res);});

// Socket.io handler on root for full-page application
app.get('/', function (req, res){
	res.sendfile(__dirname + '/index.html');
});


app.get('/application/stats', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.json(stats);
  res.end();
});

// Query api handler
// old app.get('/query', function(req,res) { query_object(req,res) }) 
app.get('/query', function(req,res) { query_db(req,res) }) 

app.get('/query/agents/active', function(req,res) { query_agents_active(req,res) }) 

// This is an Image Proxy for Graphite Images so they are served from this app
app.get('/render', function(req,res) {
	new_url = "http://" + graphite_server + ":" + graphite_server_port +  req.url;
	// Call back to image on data server
	req.pause();
	var options = url.parse( new_url );
	options.headers = req.headers;
	options.method = req.method;
	options.agent = false;
	var connector = http.request(options, function(serverResponse) {
		serverResponse.pause();
		res.writeHeader(serverResponse.statusCode, serverResponse.headers);
		serverResponse.pipe(res);
		serverResponse.resume();
	});
	req.pipe(connector);
	req.resume();
});



// Metrics find Proxy
app.get('/metrics/find', function(req,res) {
        new_url = "http://" + graphite_server + ":" + graphite_server_port +  req.url;
        console.log( new_url )
        req.pause();
        var options = url.parse( new_url );
        options.headers = req.headers;
        options.method = req.method;
        options.agent = false;
        var connector = http.request(options, function(serverResponse) {
                serverResponse.pause();
                res.writeHeader(serverResponse.statusCode, serverResponse.headers);
                serverResponse.pipe(res);
                serverResponse.resume();
        });
        req.pipe(connector);
        req.resume();
});


// This updates clients with events
// Todo: Send client objects newer than the last time updated
function update_client() {
  io.sockets.emit('object_push', stats);
  // Push new objects to browser
  if (recent_objects.length >0) {
    recent_objects.forEach( function(object) {
      stats.object_client_push_count +=1;
      io.sockets.emit('object_push', object);
  });
    recent_objects = [];
  }
}

// Listen to the port
server.listen(https_port);

// Report Ready

console.log("CONTROL: Listening on port tcp/" + https_port);

// Port 80 Flammenwerfer
app2 = express()
app2.get('/ip', function(req,res) {
   ip=req.headers['x-forwarded-for'] || req.connection.remoteAddress;

   geo=geoip.lookup(ip)
   res.json({ requestor_ip : ip, geo: geo })
   res.end()
})
app2.use(express.static('/var/www/'));
app2.listen(http_port)


// Update the clients every 10 s
//setInterval(update_client, 10000);

update_client();

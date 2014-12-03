var debug = (process.env.NODE_ENV == 'production') ? false : true
  , env = process.env.NODE_ENV || 'development';

if (env == 'development') {
  // The port the server listens on
  // Recommend: 444 / 81 for development, 443/80 for production.

  // Use these ports on development to avoid starting app with SUDO.
  exports.https_port = 3002; // port higher than 1024 does not need to be run using sudo
  exports.http_port = 3001;

// The auth is currently being re-worked. It is probably hard-coded right now in the code.
// So it will ignore this (most probably)
  exports.httpauth_user = 'redwolf'
  exports.httpauth_password = 'bigtest!'

// The host/port that metrics are sent to (graphite format   metric  value timestamp )
// default carbon-cache port is 2003
// Change localhost to control.redwolfsecurity.com if you are running locally
  exports.carbon_server = "control.redwolfsecurity.com";
  exports.carbon_server_port = 2003;

// configuration for the graphite-web
// Some times this is not 8080, but 80 (if using alternate Graphite RPM)
// Change localhost to control.redwolfsecurity.com if you are running locally
  exports.graphite_server = "localhost";
  exports.graphite_server_port = 8080;

// The Mongo DB URL. Needs to be local to this server.
// Mongo needs to run locally
  exports.mongo_database_url = "mongodb://localhost:27017/redwolf";

// Elastic Search
// Change localhost to control.redwolfsecurity.com
  exports.elastic_search_url = "http://localhost:9200/"

//  Redis
  exports.redis_url = "localhost";
  exports.redis_port = 6379;
  
// Location of Certificates
// You will need to create a self-signed certificate see: http://www.akadia.com/services/ssh_test_certificate.html
  exports.ssl = {
    key_path : "/etc/pki/CA/private/server.key",
    cert_path : "/etc/pki/CA/certs/server.crt"
  }

  exports.salt = 'Development';

  exports.debug = debug;

}

if (env == 'production') {

  // The port the server listens on
  // Recommend: 444 / 81 for development, 443/80 for production.
  exports.https_port = 443;
  exports.http_port = 80;

// The auth is currently being re-worked. It is probably hard-coded right now in the code.
// So it will ignore this (most probably)
  exports.httpauth_user = 'redwolf'
  exports.httpauth_password = 'bigtest!'

// The host/port that metrics are sent to (graphite format   metric  value timestamp )
// default carbon-cache port is 2003
// Change localhost to control.redwolfsecurity.com if you are running locally
  exports.carbon_server = "localhost";
  exports.carbon_server_port = 2003;

// configuration for the graphite-web
// Some times this is not 8080, but 80 (if using alternate Graphite RPM)
// Change localhost to control.redwolfsecurity.com if you are running locally
  exports.graphite_server = "localhost";
  exports.graphite_server_port = 8080;

// The Mongo DB URL. Needs to be local to this server.
// Mongo needs to run locally
  exports.mongo_database_url = "mongodb://localhost:27017/redwolf";

// Elastic Search
// Change localhost to control.redwolfsecurity.com
  exports.elastic_search_url = "http://localhost:9200/"

// Location of Certificates
// You will need to create a self-signed certificate see: http://www.akadia.com/services/ssh_test_certificate.html
  exports.ssl = {
    key_path : "/etc/pki/CA/private/server.key",
    cert_path : "/etc/pki/CA/certs/server.crt"
  }

  exports.salt = 'Development';

  exports.debug = debug;

}

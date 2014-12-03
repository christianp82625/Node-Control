/**
 * Created by aldo on 11/23/13.
 */
var net = require('net')
   , conf = require('../../conf')
   , carbon_server = conf.carbon_server
   , carbon_server_port = conf.carbon_server_port;

module.exports = function() {
  var this_ = this;

  this.client = {};

  console.log("Attempting to connect to carbon ip=" + carbon_server + " port=" + carbon_server_port )
  this.client = net.connect( carbon_server_port, carbon_server, function () { } );

  this.client.on('connect', function () {
    this_.client.setKeepAlive(true,1000);
    console.info( "server: STARTUP -- CARBON: Connected to " + carbon_server + " on port " + carbon_server_port );
  });

  this.client.on('error', function(err) {
    console.error('CARBON: Socket error:', err.message);
    //client.destroy();
    setTimeout(this_, 10000); //Try to reconnect
    //client = net.connect( carbon_server_port , carbon_server );
  });

  this.client.on('close', function(err) {
    console.error('CARBON: Socket close:', err.message);
    setTimeout(this_, 10000); //Try to reconnect
  });

  this.client.on('timeout', function(err) {
    console.error('CARBON: Socket error:', err.message);
    setTimeout(this_, 10000); //Try to reconnect
    //client = net.connect( carbon_server_port , carbon_server );
  });
}
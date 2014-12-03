// Hunter Collective DataServer

//var port=process.argv[2]
port=9616

var fs = require('fs');
var net = require('net');
var express = require('express');
var http = require('http')
var app = express()
var server = http.createServer(app)
var io = require('socket.io').listen(server, { log: false })
var recent_objects = []; 

// Open a socket to Graphite
var client = net.connect( 2003, 'localhost')
client.on('connect', function () {
  console.log( "GRAPHITE: Connected to localhost on port 2003" );
});

client.on('error', function(err) {
  console.log('GRAPHITE: Socket Error:', err.message);
  client = net.connect( 2003, 'localhost')
});

client.on('close', function(err) {
  console.log('GRAPHITE: Socket Cerror: losed:', err.message);
  client = net.connect( 2003, 'localhost')
});

var stats = {
  mime_type : "application/stats",
  time_started_epoch : (new Date()).getTime(),
  message_count : 0,
  object_count : 0,
  object_client_push_count : 0,
  object_save_error : 0,
  metrics_saved : 0
  
}

var databaseUrl = "object";
var collections = ["ts", "object"]
var db = require("mongojs").connect(databaseUrl, collections);

console.log('QUERYING HISTORY');

  var cursor = db.object.find({"mime_type" : "agent/stats"} , {}, function(err, objects) {
    if ( err || !objects) {
        console.log({"error" : "No objects match", "error_code" : 404});
    }
    else {
      objects_returned = objects
      // Send Metrics to Graphite
      objects.forEach( function (object) {
        if ( object.hasOwnProperty("mime_type") ){
          if ( object.mime_type == "agent/stats" ) {
            re=/\./g 
            ip = object.public_ip.replace(re , "_")
            metric_base_name = "agents." + object.ec2_region + "." + ip + ".";
            utcSeconds = object.current_timestamp_s;
            stats.object_count++
    
            metrics = [
              "net_rx_bytes_delta",
              "net_tx_bytes_delta",
              "net_tx_packets_delta",
              "net_rx_packets_delta" ]
    
            metrics.forEach( function(metric) {
              stats.metrics_saved += 1
              metric_name = metric_base_name + metric
              metric_value = object[metric]
              sleep(10)
              client.write( metric_name + " " + metric_value + " " + utcSeconds + "\n");
              console.log( metric_name + " " + metric_value + " " + utcSeconds );
            });
          }
        }
      });
      console.log("Finished!")
      console.log(stats)
    }
  });




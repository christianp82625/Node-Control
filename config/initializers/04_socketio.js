/**
 * Created by aldo on 11/22/13.
 */
var socketio = require('socket.io')
  , conf = require('../../conf.js')
  , os = require("os")
  , hostname = os.hostname()
  , graphite_server = conf.graphite_server
  , graphite_server_port = conf.graphite_server_port;


  module.exports = function() {

  this.io = socketio.listen(this.httpsServer, { log: false });

  // Handle Web Socket Connections
  this.io.sockets.on('connection', function (socket) {
//    console.log("WebSocket Connected");
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
//      console.log("Received object from browser:")
      //mq.push(new Buffer(data))
      if (data.mime_type == "command/unix") { console.log("Running command!") }
      console.log(data)
    })
  });

};
/**
 * Created by aldo on 12/2/13.
 */
/**
 * Created by aldo on 11/24/13.
 */
var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , http = require('http')
  , url  = require('url')
  , conf = require('../../conf.js')
  , isAuthorized  = require('../helpers/ensure_authenticated');

var GraphiteController = new Controller();

GraphiteController.render = function() {

  var this_ = this;

  var new_url = "http://" + conf.graphite_server + ":" + conf.graphite_server_port +  this_.req.url;
  // Call back to image on data server
  this_.req.pause();
  var options = url.parse( new_url );
  options.headers = this_.req.headers;
  options.method  = this_.req.method;
  options.agent = false;
  var connector = http.request(options, function(serverResponse) {
    serverResponse.pause();
    this_.res.writeHeader(serverResponse.statusCode, serverResponse.headers);
    serverResponse.pipe(this_.res);
    serverResponse.resume();
  });
  this_.req.pipe(connector);
  this_.req.resume();

}

GraphiteController.find = function() {

  new_url = "http://" + conf.graphite_server + ":" + conf.graphite_server_port +  this_.req.url;
  console.log( new_url );
  this_.req.pause();
  var options = url.parse( new_url );
  options.headers = this_.req.headers;
  options.method  = this_.req.method;
  options.agent   = false;
  var connector = http.request(options, function(serverResponse) {
    serverResponse.pause();
    this_.res.writeHeader(serverResponse.statusCode, serverResponse.headers);
    serverResponse.pipe(this_.res);
    serverResponse.resume();
  });
  this_.req.pipe(connector);
  this_.req.resume();

}

// FILTERS
GraphiteController.before('render', isAuthorized );
GraphiteController.before('find', isAuthorized );

module.exports = GraphiteController;



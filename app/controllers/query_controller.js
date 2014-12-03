/**
 * Created by aldo on 11/24/13.
 */
var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , isAuthorized  = require('../helpers/ensure_authenticated');

var QueryController = new Controller();

QueryController.index = function() {

  var this_ = this;
  var query = this_.req.query;
  var delimiter = ":";

  console.log('1:',query);
  console.log('2:',JSON.stringify(query));

  this_.app.stats.db_query_count++;

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

  this_.app.db.object.find(query, {}, { limit : 1000 }, function(err, objects) {
    if ( err || !objects) {
      return this_.res.json(null, { "error" : "No objects match" } , 404);
    } else {
      return this_.res.json(objects, null, 200);
    }
  });

}

QueryController.active = function() {

  var this_ = this;

  this_.app.stats.db_query_count++;
  var query = this_.req.query;
  last_n_seconds = 7 * 60; // 7 minutes
  active_since = Math.floor((new Date()).getTime()/1000) - last_n_seconds;
  query.mime_type = "agent/registration";
  query._t = {$gt: active_since};

  this_.app.db.object.find(query, {}, { limit: 5000 }, function(err, objects) {
    if ( err || !objects) {
      this_.res.json({"error" : "No objects match", "error_code" : 404});
    }
    else {
      this_.res.json(objects);
    }
  });

}

// FILTERS
QueryController.before('index', isAuthorized);
QueryController.before('active', isAuthorized);

module.exports = QueryController;



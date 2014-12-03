/**
 * Created by aldo on 12/2/13.
 */

module.exports = persist = function(object, app, next) {

  var this_ = this;

  console.log('persist');

// Add our own timestamp to all objects
  object["_t"] = Math.floor((new Date()).getTime()/1000);

  console.log(object.mime_type);

  // Is this a message? Handle it like a message.
  if ( object.mime_type == "delivery/message" ) {
    app.stats.message_count++;
    app.stats.message_count_http++;
    for(var i = 0; i < object.payload.length; i++) {
      arguments.callee(object.payload[i], app, next );
    }
  } else {
    app.db.object.update({ 'uri' : object.uri }, object, { 'upsert' : true }, function(err, updated) {
      if ( err || !updated ) {
        if (debug) {
          console.log('server -- Object not updated in Mongo');
        }
        app.stats.object_save_error++;
      } else {
        app.stats.object_count++;
      } // if err
    }); // db.object.save()
    next(true);
  } // if mime_type
}
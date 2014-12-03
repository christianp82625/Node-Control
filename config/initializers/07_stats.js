/**
 * Created by aldo on 11/23/13.
 */

module.exports = function() {

  this.stats = {
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


}

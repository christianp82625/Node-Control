/**
 * Created by aldo on 12/2/13.
 */
module.exports = metrics_to_graphite = function(object, app, next) {

  var this_ = this;

  console.log('metrics');
  console.log(object.mime_type);

  if ( object.mime_type == "delivery/message" ) {
    for(var i = 0; i < object.payload.length; i++) {
      arguments.callee(object.payload[i], app, next );
    }
  }

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
      "cpu_load_percent"
    ]

    metrics.forEach( function(metric) {
      app.stats.metrics_saved += 1
      metric_name = metric_base_name + metric
      metric_value = object[metric]
      app.client.write( metric_name + " " + metric_value + " " + utcSeconds + "\n");
    });
    //utcSeconds=Math.floor((new Date()).getTime()/1000)
    next(true);
  }
  next(false);

}
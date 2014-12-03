var PosixMQ = require('pmq');
var readbuf, mq;

mq = new PosixMQ();
mq.on('messages', function() {
var n;
while ((n = this.shift(readbuf)) !== false) {
  string_read = readbuf.toString('utf8', 0, n);
  console.log("string=" + string_read)
  string_json = JSON.parse(string_read)
  console.log("json=")
  console.log(string_json)
//console.log('Received message (' + n + ' bytes): ' + readbuf.toString('utf8', 0, n));
console.log('Messages left: ' + this.curmsgs);
}
//this.unlink();
//this.close();
});
mq.open({ name: '/redwolf_deliver' });
readbuf = new Buffer(mq.msgsize);


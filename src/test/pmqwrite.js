    var PosixMQ = require('pmq');
    var mq, writebuf, r;

    mq = new PosixMQ();
    mq.open({
      name: '/redwolf_deliver',
      create: true,
      mode: '0777'
    });
    mq.push(new Buffer("{ 'uri': '/test', 'a':1, 'test': 'string' }"))
    mq.push(new Buffer("{ 'uri': '/test', 'a':2, 'test': 'string' }"))
    mq.push(new Buffer("{ 'uri': '/test2', 'a':2, 'test': 'string', date: Date() }"))
/*
    writebuf = new Buffer(1);
    do {
      writebuf[0] = Math.floor(Math.random() * 93) + 33;
    } while ((r = mq.push(writebuf)) !== false);
*/
    mq.close();


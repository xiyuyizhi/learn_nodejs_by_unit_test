const net = require('net');

if (process.argv[2] == 'unref') {
  const server = net.createServer(() => {});
  server.listen();

  setTimeout(() => {
    server.unref();
  }, 1000);
}

if (process.argv[2] == 'close') {
  const server = net.createServer(() => {});
  const server1 = net.createServer(() => {});
  server.listen();
  server1.listen();

  setTimeout(() => {
    server.unref();
  }, 200);

  setTimeout(() => {
    server1.close();
    server.close();
  }, 600);
}

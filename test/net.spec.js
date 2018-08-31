const assert = require('assert');
const net = require('net');
const path = require('path');
const { fork } = require('child_process');

const SHELL_NAME = path.join(__dirname, '../', '', 'src/net.js');

describe('#net', function () {
  this.timeout(5000);

  it('test create a tcp server', (done) => {
    const server = net.createServer().listen(8993);

    server.on('connection', (socket) => {
      console.log(socket.address());
      assert.equal(socket.address().port, 8123);
    });

    setTimeout(() => {
      server.close();
      done();
    });
  });

  it('test two server with same port,then case error', (done) => {
    // the 'close' event will not be emitted directly following this event
    // unless server.close() is manually called
    const server = net.createServer().listen(8993);
    const server1 = net.createServer().listen(8993);

    server.on('listening', () => {
      assert.equal(server.address().port, 8993);
      assert.equal(server.listening, true);
    });

    server1.on('listening', () => {
      assert.equal(server1.listening, true);
    });

    server1.on('error', (error) => {
      // server1监听的端口冲突了
      assert.equal(server1.listening, false);
      assert.equal(error.code, 'EADDRINUSE');
      if (error.code == 'EADDRINUSE') {
        server1.close();
        server1.listen();
      }
    });

    setTimeout(() => {
      server.close();
      server1.close();
      done();
    }, 100);
  });

  it('test server.unref().【Calling unref on a server will allow the program to exit if this is the only active server in the event system】', (done) => {
    const sub = fork(SHELL_NAME, ['unref']);
    setTimeout(() => {
      assert.ok(sub.channel);
    }, 300);

    sub.on('exit', () => {
      assert.equal(sub.channel, null);
      done();
    });
  });

  it('test server.close()', (done) => {
    const sub = fork(SHELL_NAME, ['close']);
    assert.ok(sub.channel);
    setTimeout(() => {
      assert.ok(sub.channel);
    }, 300);

    sub.on('exit', () => {
      assert.equal(sub.channel, null);
    });

    setTimeout(() => {
      assert.equal(sub.channel, null);
      done();
    }, 1000);
  });

  it('test new connection to sever,emit "connection" Event of server,"connect" Event of client  ', (done) => {
    const server = net.createServer();
    server.listen(8993);

    server.on('connection', (socket) => {
      assert.equal(socket.address().port, 8993);
      assert.equal(socket.localPort, 8993);
    });

    const client = net.createConnection({ port: 8993 });

    client.on('connect', () => {
      assert.equal(client.address().port, client.localPort);
      assert.equal(client.remotePort, 8993);
      assert.ok(true);
    });

    setTimeout(() => {
      server.close();
      done();
    }, 1000);
  });

  describe('## send data', () => {
    let server;
    let client;

    beforeEach((done) => {
      server = net.createServer().listen(8993);
      client = net.createConnection({ port: 8993 });
      done();
    });

    afterEach((done) => {
      server.close();
      client.end();
      done();
    });

    it('test sever write data to client,to server', (done) => {
      server.on('connection', (socket) => {
        socket.write('data from sever');
        server.getConnections((err, count) => {
          assert.equal(count, 1);
        });
        socket.on('data', (chunk) => {
          assert.equal(chunk, 'data to server');
        });
      });
      server.on('close', () => {
        // console.log('server closed.....');
      });

      client.on('connect', () => {
        client.write('data to server');
      });
      client.setEncoding('utf8');
      client.on('data', (chunk) => {
        assert.equal(chunk, 'data from sever');
      });
      client.on('close', () => {
        // console.log('client closed......');
      });
      setTimeout(() => {
        done();
      }, 4000);
    });

    it('test establish multi connection to server', (done) => {
      let count = 0;
      server.on('connection', () => {
        server.getConnections((err, cot) => {
          count = cot;
        });
      });

      new Array(5).fill(0).forEach(() => {
        net.createConnection({ port: 8993 });
      });

      setTimeout(() => {
        assert.equal(count, 6);
        done();
      }, 1000);
    });
  });

  it('test socket close by the client', (done) => {
    const server = net.createServer().listen(8993);

    server.on('connection', (socket) => {
      // 延迟，在socket被关闭后才发送数据
      setTimeout(() => {
        socket.write('write data to client');
      }, 500);

      socket.on('error', (err) => {
        assert.equal(err.message, 'This socket has been ended by the other party');
      });
    });

    const client = net.createConnection({ port: 8993 });

    client.on('connect', () => {
      client.destroy(); // 建立连接后就把socket关闭
    });

    let clientClose = false;
    client.on('close', () => {
      clientClose = true;
    });

    setTimeout(() => {
      assert.ok(clientClose);
      server.close();
      done();
    }, 1000);
  });

  /**
   * log:
   * connect
   * connection
   * end...
   * write data to server
   */
  it('test  socket closed by server', (done) => {
    const server = net.createServer().listen(8993);

    server.on('connection', (socket) => {
      //   console.log('connection');
      socket.on('data', () => {
        // console.log(chunk.toString());
      });
      socket.end('end...');
    });

    const client = net.createConnection({ port: 8993 });

    client.on('connect', () => {
      //   console.log('connect');
      client.write('write data to server'); // can write
      setTimeout(() => {
        client.write('write data to server1'); // throw error
      }, 100);
    });

    client.on('data', () => {
      //   console.log(chunk.toString());
    });

    client.on('error', (error) => {
      assert.equal(error.message, 'This socket has been ended by the other party');
    });

    setTimeout(() => {
      server.close();
      done();
    }, 1000);
  });

  it('test allowHalfOpen', (done) => {
    const server = net
      .createServer({
        allowHalfOpen: true,
      })
      .listen(8993);

    const client = net.createConnection({ port: 8993 });

    server.on('connection', (socket) => {
      let socketClose = false;
      let endEmitOnServerSlide = false;

      setTimeout(() => {
        assert.ok(endEmitOnServerSlide);
        assert.equal(socketClose, false);
      }, 100);

      socket.on('close', () => {
        socketClose = true;
      });

      socket.on('end', () => {
        endEmitOnServerSlide = true;
      });

      // 500 ms后显式完全关闭socket
      setTimeout(() => {
        socket.end();
        setTimeout(() => {
          assert.ok(socketClose);
        });
      }, 500);
    });

    client.on('connect', () => {
      client.end(); // 建立连接后，立即管理client端socket，触发server端 socket.on('end')
    });

    let closed = false;
    let endEmitOnClientSide = false;

    // 在 socket的服务端end()后，以下两事件触发
    client.on('close', () => {
      closed = true;
    });
    client.on('end', () => {
      endEmitOnClientSide = true;
    });

    setTimeout(() => {
      assert.ok(endEmitOnClientSide);
      assert.ok(closed);
    }, 600);

    setTimeout(() => {
      server.close();
      done();
    }, 2000);
  });
});

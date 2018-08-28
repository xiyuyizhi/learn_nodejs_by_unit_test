const assert = require('assert');
const path = require('path');
const { fork } = require('child_process');
const shellPath = path.resolve(__dirname, '../src/error.js');

describe('#Error', function() {
  this.timeout(5000);

  it('test handle error by process.on("uncaughtException")', done => {
    const sub = fork(shellPath, ['uncaughtException'], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });
    sub.stdout.setEncoding('utf8');
    sub.stdout.on('data', data => {
      assert.equal(data, 'handleErrorInuncaughtException\n');
      done();
    });
  });

  it('test handle error by process.on("uncaughtException") with async', done => {
    const sub = fork(shellPath, ['uncaughtException_Async'], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });
    sub.stdout.setEncoding('utf8');
    sub.stdout.on('data', data => {
      assert.equal(data, 'a is not defined\n');
      done();
    });
  });

  it('test catch error with try catch', done => {
    const sub = fork(shellPath, ['tryCatch'], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });
    sub.stdout.setEncoding('utf8');
    let first = true;
    sub.stdout.on('data', data => {
      if (first) {
        first = false;
        assert.equal(data, 'handle in catch：a is not defined\n');
      } else {
        assert.equal(data, 'handle in uncaughtException：async error\n');
        done();
      }
    });
  });

  it('test handle error by error Event of EventEmitter', done => {
    const sub = fork(shellPath, ['handleByErrorEvent']);
    sub.on('message', data => {
      assert.equal(data, 'in error event：emit error');
      done();
    });
  });
});

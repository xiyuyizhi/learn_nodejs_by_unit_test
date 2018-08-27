const assert = require('assert');
const path = require('path');
const { fork } = require('child_process');

describe('#Error', () => {
  it('test handle error by process.on("uncaughtException")', done => {
    const sub = fork(
      path.resolve(__dirname, '../src/error.js'),
      ['uncaughtException'],
      {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc']
      }
    );
    sub.stdout.setEncoding('utf8');
    sub.stdout.on('data', data => {
      assert.equal(data, 'handleErrorInuncaughtException\n');
      done();
    });
  });

  it('test handle error by error Event of EventEmitter', () => {
    const sub = fork(
      path.resolve(__dirname, '../src/error.js'),
      ['handleByErrorEvent'],
      {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc']
      }
    );
  });
});

const assert = require('assert');
const path = require('path');
const { spawn, exec } = require('child_process');
const { execShell } = require('../util/util');
const SHELL_NAME = 'process.js';

describe('#process', function() {
  it('test process.argv`', done => {
    execShell(['process.js', 'test_argv'], argv => {
      assert.equal(argv.length, 3);
      done();
    });
  });
  it('test process.argv.length`', done => {
    execShell(['process.js', 'length', 'arg2', 'arg3'], argv => {
      assert.equal(argv[0], 5);
      done();
    });
  });
  it('test process.argv0`', done => {
    execShell(['process.js', 'test_argv0'], argv => {
      assert.equal(argv, 'node');
      done();
    });
  });
  it('test set node_env by node command and get by process.env.NODE_ENV`', done => {
    execShell(['process.js', 'env'], ['NODE_ENV=development'], argv => {
      assert.equal(argv[0], 'development');
      done();
    });
  });
});

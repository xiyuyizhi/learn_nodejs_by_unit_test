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

  it('test beforeExit event', done => {
    execShell(['process.js', 'beforeExit'], argv => {
      assert.equal(argv[0], 'exitCode:0');
      done();
    });
  });
  it('test beforeExit event not emit when explicitly call process.exit()', done => {
    execShell(['process.js', 'processExplicitlyExit'], (argv, stderr, err) => {
      assert.equal(argv[0], undefined);
      assert.equal(err, null);
      done();
    });
  });
  it('test beforeExit event not emit when explicitly call process.exit(1)', done => {
    execShell(['process.js', 'processExplicitlyExit1'], (argv, stderr, err) => {
      assert.equal(argv[0], undefined);
      assert.ok(err);
      done();
    });
  });
  it('test beforeExit event emit when explicitly set process.exitCode', done => {
    execShell(
      ['process.js', 'processExplicitlyExitCode'],
      (argv, stderr, err) => {
        assert.equal(argv.length, 2);
        assert.equal(argv[0], 'exitCode:1');
        assert.equal(argv[1], 'ExitEvnt|exitCode:1');
        assert.ok(err);
        done();
      }
    );
  });
});

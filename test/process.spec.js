const assert = require('assert');
const { spawn, exec, fork } = require('child_process');
const { execShell } = require('../util/util');
const SHELL_NAME = 'process.js';

describe('#process', function() {
  this.timeout(5000);

  it('test process.argv`', done => {
    execShell([SHELL_NAME, 'test_argv'], argv => {
      assert.equal(argv.length, 3);
      done();
    });
  });
  it('test process.argv.length`', done => {
    execShell([SHELL_NAME, 'length', 'arg2', 'arg3', '--version'], argv => {
      assert.equal(argv[0], 6);
      done();
    });
  });
  it('test set node_env by node command and get by process.env.NODE_ENV`', done => {
    execShell([SHELL_NAME, 'env'], ['NODE_ENV=development'], argv => {
      assert.equal(argv[0], 'development');
      done();
    });
  });

  it('test beforeExit event', done => {
    execShell([SHELL_NAME, 'beforeExit'], argv => {
      assert.equal(argv[0], 'exitCode:0');
      done();
    });
  });
  it('test beforeExit event not emit when explicitly call process.exit()', done => {
    execShell([SHELL_NAME, 'processExplicitlyExit'], (argv, stderr, err) => {
      assert.equal(argv[0], undefined);
      assert.equal(err, null);
      done();
    });
  });
  it('test beforeExit event not emit when explicitly call process.exit(1)', done => {
    execShell([SHELL_NAME, 'processExplicitlyExit1'], (argv, stderr, err) => {
      assert.equal(argv[0], undefined);
      assert.ok(err);
      done();
    });
  });
  it('test beforeExit event emit when explicitly set process.exitCode', done => {
    execShell(
      [SHELL_NAME, 'processExplicitlyExitCode'],
      (argv, stderr, err) => {
        assert.equal(argv.length, 2);
        assert.equal(argv[0], 'exitCode:1');
        assert.equal(argv[1], 'ExitEvnt|exitCode:1');
        assert.ok(err);
        done();
      }
    );
  });

  it('test process.nextTick()', done => {
    execShell([SHELL_NAME, 'nextTick'], argv => {
      assert.deepEqual(argv, [
        'before',
        'after',
        'in_Tick_callback',
        'in_Immediate'
      ]);
      done();
    });
  });

  describe('## Error Catch And Promise', () => {
    it('test unhandledRejection Event emit when no catch(),no error handler in then()', done => {
      execShell([SHELL_NAME, 'unhandledRejectionEmit'], (argv, stderr, err) => {
        assert.equal(argv[0], 'in_unhandledRejection_event:reject_value');
        done();
      });
    });
    it('test unhandledRejection Event not emit', done => {
      execShell(
        [SHELL_NAME, 'unhandledRejectionNoEmit'],
        (argv, stderr, err) => {
          assert.equal(argv.length, 1);
          assert.equal(argv[0], 'in_catch_:reject_value');
          done();
        }
      );
    });
    it('test throw error in success handler of then() and catch error in catch()', done => {
      execShell([SHELL_NAME, 'throwErrorInThen'], (argv, stderr, err) => {
        assert.equal(argv.length, 2);
        assert.equal(argv[0], 'get_result:resolve_value');
        assert.equal(argv[1], 'in_catch_:error_in_success_handler');
        done();
      });
    });
    it('test uncaughtException Event not emit', done => {
      execShell([SHELL_NAME, 'uncaughtExceptionNoEmit'], argv => {
        assert.equal(argv.length, 1);
        assert.equal(argv[0], 'In_Catch:error');
        done();
      });
    });
  });
});

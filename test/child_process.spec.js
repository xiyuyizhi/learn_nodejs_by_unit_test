const assert = require('assert');
const path = require('path');
const { spawn, exec, fork } = require('child_process');
const SHELL_NAME = 'child_process.js';

const { resolvePath, translateArrStrToArr } = require('../util/util');

describe('#Child_Process', function() {
  this.timeout(5000);

  it('test process.send(),process.on("message") ', done => {
    const subprocess = fork(resolvePath(SHELL_NAME), ['signal']);
    subprocess.on('message', pid => {
      assert.equal(subprocess.pid, pid);
      done();
    });
  });

  it('test kill child process by parent process ', done => {
    const subprocess = fork(resolvePath(SHELL_NAME), ['killChild']);

    assert.equal(subprocess.connected, true);

    setTimeout(() => {
      subprocess.kill();
      // subprocess.send('exit');
    }, 100);

    setTimeout(() => {
      assert.equal(subprocess.connected, false);
      done();
    }, 300);
  });

  it('test fork() with options.silent = true', done => {
    const subprocess = fork(resolvePath(SHELL_NAME), ['silent'], {
      silent: true
    });
    assert.ok(subprocess.stdout);
    subprocess.stdout.on('data', data => {
      const result = translateArrStrToArr(data.toString());
      assert.equal(result[0], 'log_to_parent_not_to_terminal');
      done();
    });
  });

  it('test setting fork() options.stdio', done => {
    const subprocess = fork(resolvePath(SHELL_NAME), ['options_stdio'], {
      stdio: ['pipe', 'inherit', 'inherit', 'ipc'] // error 流到 parent process , stdout、stderr继承parent,打印到terminal
    });

    assert.ok(subprocess.stdin);
    assert.equal(subprocess.stdout, null);
    assert.equal(subprocess.stderr, null);

    done();
  });
});

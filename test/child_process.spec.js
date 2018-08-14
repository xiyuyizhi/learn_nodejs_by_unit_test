const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { spawn, exec, fork } = require('child_process');
const { resolvePath, translateArrStrToArr } = require('../util/util');
const SHELL_NAME = resolvePath('child_process.js');

describe('#Child_Process', function() {
  this.timeout(5000);

  it('test process.send(),process.on("message") ', done => {
    const subprocess = fork(SHELL_NAME, ['signal']);
    subprocess.on('message', pid => {
      assert.equal(subprocess.pid, pid);
      done();
    });
  });

  it('test kill child process by clearInterval or process.exit() ', done => {
    const subprocess = fork(SHELL_NAME, ['killChild'], {
      stdio: ['inherit', 'pipe', 'inherit', 'ipc']
    });
    assert.equal(subprocess.connected, true);
    subprocess.stdout.on('data', data => {
      assert.equal(subprocess.pid + '_exit\n', data.toString());
    });
    setTimeout(() => {
      subprocess.kill();
      // subprocess.send("exit");
    }, 200);
    setTimeout(() => {
      assert.equal(subprocess.connected, false);
      done();
    }, 500);
  });

  it('test child process not exit when have message Event and not explicit call process.exit() ', done => {
    const subprocess = fork(SHELL_NAME, ['notEmitWhenHaveMessage']);
    assert.equal(subprocess.connected, true);
    setTimeout(() => {
      subprocess.send('exit'); //not effect
    }, 200);
    setTimeout(() => {
      assert.equal(subprocess.connected, true);
    }, 300);
    setTimeout(() => {
      assert.equal(subprocess.connected, true);
      subprocess.kill();
    }, 400);
    setTimeout(() => {
      assert.equal(subprocess.connected, false);
      done();
    }, 500);
  });

  it('test fork() with options.silent = true', done => {
    const subprocess = fork(SHELL_NAME, ['silent'], {
      silent: true // default is false(inherited from the parent,this time,log to terminal)
    });
    assert.ok(subprocess.stdout);
    subprocess.stdout.on('data', data => {
      const result = translateArrStrToArr(data.toString());
      assert.equal(result[0], 'log_to_parent_not_to_terminal');
      done();
    });
  });

  it('test setting options.stdio', done => {
    const subprocess = fork(SHELL_NAME, ['options_stdio'], {
      stdio: ['pipe', 'inherit', 'pipe', 'ipc'] // stdin pipe parent process , stdout、stderr继承parent,打印到terminal
    });

    assert.ok(subprocess.stdin);
    assert.equal(subprocess.stdout, null);
    subprocess.stderr.on('data', data => {
      assert.ok(data);
      done();
    });
  });

  it('test closes the IPC channel between parent and child', done => {
    const subprocess = fork(SHELL_NAME, ['closeChannel']);
    assert.equal(subprocess.connected, true);

    setTimeout(() => {
      subprocess.kill();
    }, 100);

    setTimeout(() => {
      subprocess.disconnect(); // 关闭父子间IPC通道
      assert.equal(subprocess.connected, false);
      done();
    }, 300);
  });

  describe('## stdout to file', () => {
    after(function() {
      fs.unlinkSync('test/stdout.txt');
      fs.unlinkSync('test/stderr.txt');
    });

    it('test write child process stdout to file', done => {
      spawn('ls', ['/noExitDir'], {
        stdio: [
          'pipe',
          fs.openSync('test/stdout.txt', 'w'),
          fs.openSync('test/stderr.txt', 'w')
          // process.stderr
        ]
      });
      setTimeout(() => {
        const exits = fs.existsSync('test/stdout.txt');
        assert.ok(exits);
        const err = fs.readFileSync('test/stderr.txt', 'utf8');
        assert.equal(err, 'ls: /noExitDir: No such file or directory\n');
        done();
      }, 100);
    });
  });

  it('test childprocess.stdin as writeable stream', done => {
    const subprocess = fork(SHELL_NAME, ['stdinWritable'], {
      stdio: ['pipe', 'pipe', process.stderr, 'ipc']
    });

    //writable stream
    subprocess.stdin.write('write data to child process');

    // readable stream
    subprocess.stdout.on('data', data => {
      assert.equal(data.toString(), 'write data to child process\n');
      done();
    });
  });
});

switch (process.argv[2]) {
  case 'test_argv':
    console.log(process.argv);
    break;
  case 'test_argv0':
    console.log(process.argv0);
    break;
  case 'length':
    console.log(process.argv.length);
    break;
  case 'env':
    console.log(process.env.NODE_ENV);
    break;
  case 'beforeExit':
    beforeExit();
    break;
  case 'processExplicitlyExit':
    processExplicitlyExit();
    break;
  case 'processExplicitlyExit1':
    processExplicitlyExit1();
    break;
  case 'processExplicitlyExitCode':
    processExplicitlyExitCode();
    break;
  case 'signal':
    signal();
    break;
  case 'killChild':
    killChild();
    break;
}

function beforeExit() {
  process.on('beforeExit', exitCode => {
    console.log('exitCode:' + exitCode);
  });
}

function processExplicitlyExit() {
  process.on('beforeExit', exitCode => {
    //not emit
    console.log('exitCode:' + exitCode);
  });
  process.exit();
}

function processExplicitlyExit1() {
  process.on('beforeExit', exitCode => {
    //not emit and throw error
    console.log('exitCode:' + exitCode);
  });
  process.exit(1);
}

function processExplicitlyExitCode() {
  process.on('beforeExit', exitCode => {
    //not emit and throw error
    console.log('exitCode:' + exitCode);
  });
  process.on('exit', exitCode => {
    //not emit and throw error
    console.log('ExitEvnt|exitCode:' + exitCode);
  });

  process.exitCode = 1;
}

function signal() {
  process.send(process.pid);
}

function killChild() {
  setInterval(() => {}, 3000);

  process.on('SIGTERM', () => {
    console.log('got SIGTERM signal');
    process.exit();
  });

  process.on('message', msg => {
    console.log('child get msg: ' + msg);
    process.exit();
  });

  process.on('exit', () => {
    console.log(`process ${process.pid} exit`);
  });
}

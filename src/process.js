switch (process.argv[2]) {
  case 'test_argv':
    console.log(process.argv);
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
  case 'nextTick':
    nextTick();
    break;
  case 'unhandledRejectionEmit':
    unhandledRejectionEmit();
    break;
  case 'unhandledRejectionNoEmit':
    unhandledRejectionNoEmit();
    break;
  case 'throwErrorInThen':
    throwErrorInThen();
    break;
  case 'uncaughtExceptionNoEmit':
    uncaughtExceptionNoEmit();
    break;
  default:
    break;
}

function beforeExit() {
  process.on('beforeExit', (exitCode) => {
    console.log(`exitCode:${exitCode}`);
  });
}

function processExplicitlyExit() {
  process.on('beforeExit', (exitCode) => {
    // not emit
    console.log(`exitCode:${exitCode}`);
  });
  process.exit();
}

function processExplicitlyExit1() {
  process.on('beforeExit', (exitCode) => {
    // not emit and throw error
    console.log(`exitCode:${exitCode}`);
  });
  process.exit(1);
}

function processExplicitlyExitCode() {
  process.on('beforeExit', (exitCode) => {
    // not emit and throw error
    console.log(`exitCode:${exitCode}`);
  });
  process.on('exit', (exitCode) => {
    // not emit and throw error
    console.log(`ExitEvnt|exitCode:${exitCode}`);
  });

  process.exitCode = 1;
}

function signal() {
  console.log('signal......');
  process.send(process.pid);
}

function killChild() {
  setInterval(() => {}, 3000);

  process.on('SIGTERM', () => {
    console.log('got SIGTERM signal');
    process.exit();
  });

  process.on('message', (msg) => {
    console.log(`child get msg: ${msg}`);
    process.exit();
  });

  process.on('exit', () => {
    console.log(`process ${process.pid} exit`);
  });
}

function nextTick() {
  setImmediate(() => {
    console.log('in_Immediate');
  });
  process.nextTick(() => {
    console.log('in_Tick_callback');
  });
  console.log('before');
  console.log('after');
}

function unhandledRejectionEmit() {
  process.on('unhandledRejection', (reason) => {
    console.log(`in_unhandledRejection_event:${reason.message}`);
  });

  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('reject_value'));
    }, 200);
  });
}

function unhandledRejectionNoEmit() {
  process.on('unhandledRejection', () => {
    // will emit when not catch below
    console.log('can not emit');
  });

  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('reject_value'));
    }, 200);
  }).catch((x) => {
    console.log(`in_catch_:${x.message}`);
  });
}

function throwErrorInThen() {
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('resolve_value');
    }, 200);
  })
    .then(
      (res) => {
        console.log(`get_result:${res}`);
        throw new Error('error_in_success_handler');
      },
      () => {
        console.log('not emit');
      }
    )
    .catch((x) => {
      console.log(`in_catch_:${x.message}`);
    });
}

function uncaughtExceptionNoEmit() {
  process.on('uncaughtException', (err) => {
    // will emit when no catch below
    console.log(`uncaughtException:${err.message}`);
  });

  try {
    throw new Error('error');
  } catch (x) {
    console.log(`In_Catch:${x.message}`);
  }
}

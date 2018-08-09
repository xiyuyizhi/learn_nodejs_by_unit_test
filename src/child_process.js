switch (process.argv[2]) {
  case 'signal':
    signal();
    break;
  case 'killChild':
    killChild();
    break;
  case 'silent':
    silent();
    break;
  case 'options_stdio':
    options_stdio();
    break;
}

function signal() {
  process.send(process.pid);
}

function killChild() {
  setInterval(() => {}, 3000);

  process.on('SIGTERM', () => {
    // console.log('got SIGTERM signal');
    process.exit();
  });

  process.on('message', msg => {
    // console.log('child get msg: ' + msg);
    process.exit();
  });

  process.on('exit', () => {
    console.log(`process ${process.pid} exit`);
  });
}

function silent() {
  console.log('log_to_parent_not_to_terminal');
}

function options_stdio() {}

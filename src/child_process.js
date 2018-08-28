switch (process.argv[2]) {
  case 'signal':
    signal();
    break;
  case 'killChild':
    killChild();
    break;
  case 'notEmitWhenHaveMessage':
    notEmitWhenHaveMessage();
    break;
  case 'silent':
    silent();
    break;
  case 'options_stdio':
    options_stdio();
    break;
  case 'closeChannel':
    closeChannel();
    break;
  case 'stdinWritable':
    stdinWritable();
    break;
}

function signal() {
  process.send(process.pid);
}

function killChild() {
  const timer = setInterval(() => {}, 300);

  process.on('SIGTERM', () => {
    // process.exit();
    clearInterval(timer);
  });
}
function notEmitWhenHaveMessage() {
  const timer = setInterval(() => {}, 300);
  process.on('SIGTERM', () => {
    process.exit();
    // clearInterval(timer); // not effect,can not exit process
  });
  process.on('message', msg => {
    clearInterval(timer); // not effect,can not exit process
  });
}

function silent() {
  console.log('log_to_parent_not_to_terminal');
}

function options_stdio() {
  throw new Error('error');
}

function closeChannel() {
  const timer = setInterval(() => {}, 300);
  process.on('SIGTERM', () => {
    clearInterval(timer);
  });

  process.on('message', () => {});
}

function stdinWritable() {
  process.stdin.on('data', data => {
    console.log(data.toString());
  });
}

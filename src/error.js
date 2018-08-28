//
//
//
const EventEmitter = require('events');

if (process.argv[2] == 'uncaughtException') {
  process.on('uncaughtException', error => {
    console.log(error.message);
  });

  throw new Error('handleErrorInuncaughtException');
}

if (process.argv[2] == 'uncaughtException_Async') {
  process.on('uncaughtException', error => {
    console.log(error.message);
  });

  setTimeout(() => {
    console.log(a);
  }, 1000);
}

if (process.argv[2] == 'tryCatch') {
  process.on('uncaughtException', error => {
    console.log('handle in uncaughtException：' + error.message);
  });

  try {
    console.log(a);
  } catch (e) {
    console.log('handle in catch：' + e.message);
    setTimeout(() => {
      throw new Error('async error');
    }, 1000);
  }
}

if (process.argv[2] == 'handleByErrorEvent') {
  class CustomE extends EventEmitter {}
  const cusE = new CustomE();

  cusE.addListener('event1', () => {
    setTimeout(() => {
      cusE.emit('error', new Error('emit error'));
    });
  });

  cusE.on('error', error => {
    process.send('in error event：' + error.message);
  });

  cusE.emit('event1');
}

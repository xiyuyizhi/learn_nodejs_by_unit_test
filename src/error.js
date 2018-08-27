if (process.argv[2] == 'uncaughtException') {
  process.on('uncaughtException', error => {
    console.log(error.message);
  });

  throw new Error('handleErrorInuncaughtException');
}

if (process.argv[2] == 'handleByErrorEvent') {
}

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
}

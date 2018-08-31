const assert = require('assert');
const path = require('path');

describe('#Module', () => {
  it('test __dirname, __filename', () => {
    assert.equal(__dirname, `${process.cwd()}/test`);
    assert.equal(__filename, `${__dirname}/module.spec.js`);

    const { retFileName } = require('../src/test_use_by_require.js');

    assert.equal(retFileName(), path.join(__dirname, '../', '/src/test_use_by_require.js'));
  });

  it('test require() seach file use  main prop in package.json', () => {
    const { searchPackageJson } = require('../../learn_nodejs_by_unit_test');
    assert.ok(searchPackageJson);
  });

  it('test require.resolve()', () => {
    const paths = require.resolve('../src/process.js');
    assert.equal(paths, path.join(__dirname, '../', 'src/process.js'));
  });

  it('test module.path', () => {
    require('../../learn_nodejs_by_unit_test');
    assert.equal(module.paths.length, __dirname.split('/').length);
  });
});

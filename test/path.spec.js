const path = require('path');
const assert = require('assert');

describe('#Path', () => {
  it('path.basename()', () => {
    assert.equal(path.basename('~/test/a.txt'), 'a.txt');
  });

  it('path.delimiter,:for POIX', () => {
    const str = '1:2:3:4';
    const arr = str.split(path.delimiter);
    assert.equal(arr[0], 1);
    assert.equal(arr[3], 4);
    assert.equal(arr.length, 4);
  });

  it('path.dirname(path)', () => {
    const _path = '/Users/cage/codeme/learn_nodejs_by_unit_test/path.spec.js';

    assert.equal(
      path.dirname(_path),
      '/Users/cage/codeme/learn_nodejs_by_unit_test'
    );
  });

  it('path.extname(path)', () => {
    assert.equal(path.extname('a.index'), '.index');
    assert.equal(path.extname('index.coffee.md'), '.md');
    assert.equal(path.extname('abc'), '');
    assert.equal(path.extname('.abc'), '');
  });

  it('path.join()', () => {
    assert.equal(
      path.join('/foo', 'bar', 'baz/asdf', 'quux', '..'),
      '/foo/bar/baz/asdf'
    );
    assert.equal(path.join('../abc', 'd', 'e'), '../abc/d/e');

    assert.equal(path.join('../abc', 'd', 'e/'), '../abc/d/e/');

    assert.equal(path.join('../abc', 'd', '/e'), '../abc/d/e');

    assert.equal(path.join('../abc', 'd', '/e', './'), '../abc/d/e/');

    assert.equal(path.join('../abc', 'd', '/e', '../'), '../abc/d/');
  });

  it('path.resolve()', () => {
    assert.equal(path.resolve('/a', '/b'), '/b');

    assert.equal(path.resolve('/a', '/bc', 'd'), '/bc/d');

    assert.equal(path.resolve('/a', '/bc', 'd', '../'), '/bc');

    assert.equal(path.resolve('/a', '/bc', 'd', '..'), '/bc');
  });
});

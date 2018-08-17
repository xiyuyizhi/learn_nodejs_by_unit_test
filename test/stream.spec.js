const fs = require('fs');
const assert = require('assert');
const { execSync } = require('child_process');
const { PassThrough, Writable, Readable } = require('stream');
const FILEPATH = 'test/write.txt';
const { ToFileStream } = require('../src/toFileStream');
let pass;

describe('#Stream', () => {
  beforeEach(() => {
    fs.openSync(FILEPATH, 'w+');
    pass = new PassThrough();
  });
  afterEach(() => {
    fs.unlinkSync(FILEPATH);
    pass = null;
  });

  it('test Writable stream reach highWaterMark', done => {
    const writer = fs.createWriteStream(FILEPATH);
    const highWaterMark = writer.writableHighWaterMark;
    const canWriteLinesBeforeReachHighWaterMark = Math.floor(
      highWaterMark / 19
    );
    let current = 0;
    let drainEmit = false;
    for (let i = 0; i < 1000; i++) {
      const rs = writer.write('一行十九字节\n');
      if (!rs) {
        current = i;
        break;
      }
    }
    assert.equal(canWriteLinesBeforeReachHighWaterMark, current);
    writer.on('drain', () => {
      drainEmit = true;
    });
    setTimeout(() => {
      assert.ok(drainEmit);
      done();
    }, 100);
  });

  it('test readable stream two Mode : flowing', done => {
    //自动读取数据,data时间
    pass.on('data', chunk => {
      assert.equal(chunk.toString(), 'flowing mode');
      done();
    });
    pass.end('flowing mode');
  });

  it('test readable stream two Mode : paused', done => {
    //手动调动stream.read()
    let count = 0;
    pass.on('readable', () => {
      let chunk;
      while ((chunk = pass.read()) != null) {
        count++;
      }
    });
    pass.on('end', () => {
      assert.equal(count, 1000);
      done();
    });
    for (let i = 0; i < 1000; i++) {
      const reachLimit = pass.write('paused mode');
    }
    pass.end();
  });

  /**
   * paused  mode switch flowing mode by pipe()、data Event、pause()
   */
  it('test readable switch to Paused mode by call readable.pause()', done => {
    const writable = fs.createWriteStream(FILEPATH);
    let dataEventNotEmit = true;
    pass.pause();

    pass.on('data', data => {
      dataEventNotEmit = false;
    });
    pass.write('not emit data Event');
    pass.end();

    setTimeout(() => {
      assert.equal(dataEventNotEmit, true); //  data event no emit
      pass.resume(); //stream  resume
    }, 50);

    setTimeout(() => {
      assert.equal(dataEventNotEmit, false);
      done();
    }, 100);
  });

  it('test readable switch to Paused mode by call  readable.unpipe()', done => {
    const writable = fs.createWriteStream(FILEPATH);
    let dataEventNotEmit = false;
    let readableEventEmit = true;
    pass.pipe(writable);
    pass.unpipe(writable);

    //no emit
    pass.on('data', data => {
      dataEventNotEmit = true;
    });

    //emit
    pass.on('readable', () => {
      assert.equal(readableEventEmit, true);
    });

    pass.write('not emit data Event');
    pass.end();

    setTimeout(() => {
      assert.equal(dataEventNotEmit, false); //  data event no emit
      pass.resume(); //stream  resume
    }, 50);

    setTimeout(() => {
      assert.equal(dataEventNotEmit, true);
      done();
    }, 100);
  });

  it('test readable.setEncoding()', done => {
    pass.setEncoding('utf8');

    pass.on('data', chunk => {
      assert.equal(typeof chunk, 'string');
      done();
    });

    pass.write('utf8');
    pass.end();
  });

  describe('##pipe options.end', () => {
    before(done => {
      fs.writeFile('test/a.txt', 'content1234567', err => {
        done();
      });
    });

    after(() => {
      fs.unlinkSync('test/a.txt');
    });

    it('test pipe() options.end = false', done => {
      const reader = fs.createReadStream('test/a.txt');
      const writer = fs.createWriteStream(FILEPATH);
      reader.pipe(
        writer,
        { end: false } // writable stream not close auto
      );

      reader.on('end', () => {
        writer.end('goodbey', () => {
          const r = fs.createReadStream(FILEPATH);
          r.setEncoding('utf8');
          r.on('data', chunk => {
            assert.equal(chunk, 'content1234567goodbey');
            done();
          });
        });
      });
    });
  });

  it('test implement a writable stream throw Error', done => {
    const myWritable = new Writable({
      write(chunk, encoding, callback) {
        if (chunk.toString().indexOf('a') >= 0) {
          callback(new Error('chunk is invalid'));
        } else {
          callback();
        }
      }
    });
    myWritable.on('error', error => {
      assert.equal(error.message, 'chunk is invalid');
    });
    myWritable.write('abc', err => {
      assert.equal(err.message, 'chunk is invalid');
    });

    done();
  });
  it('test implement a writable stream', done => {
    const tfs = new ToFileStream();
    tfs.write({ path: 'test/1.txt1', content: 'data1' }, () => {});
    tfs.write({ path: 'test/2.txt1', content: 'data2' }, () => {});

    tfs.end(() => {
      const count = execSync('ls test | grep txt1 | wc -l', {
        encoding: 'utf8'
      });
      assert.equal(count, 2);
      ['test/1.txt1', 'test/2.txt1'].forEach(x => {
        fs.unlinkSync(x);
      });
      done();
    });
  });
  it('test implement a readable stream', done => {
    class Counter extends Readable {
      constructor(opt) {
        super(opt);
        this._max = 100;
        this._index = 0;
      }

      _read() {
        const i = this._index++;
        if (i >= this._max) this.push(null);
        else {
          const str = '' + i;
          const buf = Buffer.from(str, 'ascii');
          this.push(buf);
        }
      }
    }

    const c = new Counter({
      encoding: 'utf8'
    });
    const arr = [];
    let count = 0;
    c.on('data', chunk => {
      count++;
      arr.push(chunk);
    });

    c.on('end', () => {
      assert.equal(count, 100);
      assert.equal(arr[0], '0');
      assert.equal(arr[99], '99');
      done();
    });
  });
});

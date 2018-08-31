const { Writable } = require('stream');
const fs = require('fs');

class ToFileStream extends Writable {
  constructor() {
    super({
      objectMode: true,
    });
  }

  /* eslint no-underscore-dangle:'off' */
  _write(chunk, encoding, callback) {
    fs.writeFile(chunk.path, chunk.content, (err) => {
      if (err) {
        return callback(err);
      }
      callback();
    });
  }
}

exports.ToFileStream = ToFileStream;

'use strict';

const { Transform } = require('stream');

class PipeBox extends Transform {
  constructor(options = {}) {
    const { writeable, readable, ...rest } = options;
    super(rest);
    if (writeable) {
      this._writeable = writeable;
    }
    if (readable) {
      this._readable = readable;
    }

    this._initiated = false;
  }

  _init() {
    this._initiated = true;
    this._readable.on('readable', () => {
      let chunk;
      while ((chunk = this._readable.read()) !== null) {
        if (this.push(chunk) === false) {
          break;
        }
      }
    });
  }

  _transform(chunk, encoding, callback) {
    if (!this._initiated) {
      this._init();
    }
    if (!this._writeable.write(chunk, encoding)) {
      this._writeable.once('drain', () => this.uncork());
      this.cork();
    }
    callback();
  }

  _flush(callback) {
    this._readable.on('end', () => callback());
    this._writeable.end();
  }
}

module.exports = PipeBox;

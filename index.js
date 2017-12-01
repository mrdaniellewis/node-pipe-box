'use strict';

const { Transform } = require('stream');

class PipeBox extends Transform {
  constructor(options = {}) {
    const { writeable, readable, ...rest } = options;
    super(rest);
    if (writeable) {
      this.writeable = writeable;
    }
    if (readable) {
      this.readable = readable;
    }

    this._initiated = false;
  }

  _init() {
    this._initiated = true;
    this.readable.on('readable', () => {
      let chunk;
      while ((chunk = this.readable.read()) !== null) {
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
    if (!this.writeable.write(chunk, encoding)) {
      this.writeable.once('drain', () => this.uncork());
      this.cork();
    }
    callback();
  }

  _flush(callback) {
    this.readable.on('end', () => callback());
    this.writeable.end();
  }
}

module.exports = PipeBox;

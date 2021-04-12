/* eslint-env jest */

'use strict';

const { Transform, PassThrough } = require('stream');
const { Collect } = require('stream-collect');
const fs = require('fs');
const pathUtils = require('path');
const PipeBox = require('.');

const path = pathUtils.resolve(__dirname, 'the-machine-stops.txt');
const data = fs.readFileSync(path, { encoding: 'utf8' });

describe('PipeBox', () => {
  it('is a duplex stream', () => {
    const readable = new PassThrough();
    const writeable = readable;
    expect(new PipeBox({ readable, writeable })).toBeInstanceOf(Transform);
  });

  it('encapsulates a chain of streams', () => {
    const readable = new PassThrough();
    const writeable = readable;
    const pipeBox = new PipeBox({ readable, writeable });

    return fs.createReadStream(path, { encoding: 'utf8' })
      .pipe(pipeBox)
      .pipe(new Collect())
      .collect()
      .then((collected) => {
        expect(collected.toString()).toEqual(data);
      });
  });
});

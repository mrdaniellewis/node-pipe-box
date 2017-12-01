# Pipe box

[![npm version](https://badge.fury.io/js/pipe-box.svg)](http://badge.fury.io/js/pipe-box)

Encapsulate a series of piped streams into a single stream object,

```js

const PipeBox = require('pipe-box');

const pipedSequence = sourceStream
  .pipe(someTransform)
  .pipe(someOtherTransform);

var pipeBox = new PipeBox( { writeable: sourceStream, readable: pipedSequence } );

pipeBox.write('something');
pipeBox.read() // => The something transformed by the transforms
```

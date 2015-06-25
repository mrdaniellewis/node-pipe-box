# Pipe box

[![npm version](https://badge.fury.io/js/pipe-box.svg)](http://badge.fury.io/js/pipe-box)

A stream constructor that turns a series of piped streams into a single stream.

It is duplex stream that will write to a stream and will read from another stream.

See the example below.  If the sourceStream and outputStream are not specified a pass-though stream will be used and the pipe-box will act as an (overcomplicated) pass-though stream.

```js

var PipeBox = require('pipe-box');

var pipedSequence = sourceStream
	.pipe(someTransform)
	.pipe(someOtherTransform);

var pipeBox = new PipeBox( { inputStream: sourceStream, outputStream: pipedSequence } );

pipeBox.write('something');
pipeBox.read() // => The something transformed by the transforms

// This can also be done using a constructor

function MyAwesomeStream() {
	this._inputStream = new SourceStream();
	this._outputStream = this._inputStream
		.pipe( new SomeTransform() )
		.pipe( new SomeOtherTransform() );

	PipeBox.call(this);
}

util.inherits( MyAwesomeStream, PipeBox );
```

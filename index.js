/* jshint node: true */
"use strict";

var stream = require('stream');
var util = require('util');

/**
 *	This class is intended to be extended
 *	The constructor should to set a _inputStream and _outputStream object,
 * 	the writable side of the class will then write to _inputStream and the 
 *	readable side read from _outputStream.
 *
 *	Alternativly the output and input streams can be passed as options
 *	to this constructor
 *
 *	If the output and input stream is not specified it becomes an overcomplex
 *	passthough stream
 */
function PipeBox(options) {	
	
	options = options || {};

	var duplexOptions = {};
	for ( var i in options ) {
		duplexOptions[i] = options[i];
	}
	duplexOptions.allowHalfOpen = true;

	stream.Duplex.call( this, duplexOptions );

	this._inputStream = this._inputStream || options.inputStream || new stream.PassThrough();
	this._outputStream = this._outputStream || options.outputStream || this._inputStream;

	this._outputStream
		.on( 'end', function() {
			// Send the end chunk
			this.push(null);
		}.bind(this) )
		.on( 'finish', function() {
			// For some reason the input stream can require
			// a little kick to output end event in some circumstances
			// I'd write a test case if I could figure it out
			this.read(0);
		} );

	this.on( 'finish', function() {
		// We've got all the data in, end the inputstream
		this._inputStream.end();
	}.bind(this) );

}

util.inherits( PipeBox, stream.Duplex );

PipeBox.prototype._write = function( chunk, encoding, cb ) {
	
	// Pass the data to the input
	// If the input is buffering wait for a drain before allowing to continue
	if ( !this._inputStream.write( chunk, encoding ) ) {
		this._inputStream.once( 'drain', function() {
			cb();
		} );
	} else {
		cb();
	}

};

PipeBox.prototype._read = function() {

	// The size argument is not the size argument passed by the user
	// It appears to actually be the highWaterMark
	// This means it can't practially be used

	// Just try and read until nothing is returned or pipebox tells us to stop
	var chunk;
	while( null !== ( chunk = this._outputStream.read() ) ) {
		if ( !this.push( chunk ) ) {
			break;
		}
	}

};

module.exports = PipeBox;

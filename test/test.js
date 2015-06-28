/* jshint node: true, mocha: true */
"use strict";

var expect = require('expect');
var PipeBox = require('../');
var stream = require('stream');
var collect = require('stream-collect');
var sinon = require('sinon');
var util = require('util');

describe( 'PipeBox', function() {
	
	it( 'constructs a PipeBox instance', function() {

		expect( new PipeBox() ).toBeA( PipeBox );

	} );

	it( 'is a duplex stream', function() {

		expect( new PipeBox() ).toBeA( stream.Duplex );

	} );

	it( 'acts as a PassThrough stream', function() {

		var pipeBox = new PipeBox();

		pipeBox.write('foo');
		pipeBox.end('bar');

		return collect(pipeBox)
			.then( function(data) {
				expect(data.toString()).toBe('foobar');
			} );

	} );

	it( 'passes written data to _inputStream (using options)', function() {

		var inputStream = new stream.PassThrough();

		var pipeBox = new PipeBox( { inputStream: inputStream } );

		pipeBox.write('foo');
		pipeBox.end('bar');

		return collect(inputStream)
			.then( function(data) {
				expect(data.toString()).toBe('foobar');
			} );

	} );

	it( 'passes written data to _inputStream (using a constructor)', function() {

		var inputStream = new stream.PassThrough();

		var CustomPipeBox = function() {
			this._inputStream = inputStream;
			PipeBox.call(this);
		};

		util.inherits( CustomPipeBox, PipeBox );

		var pipeBox = new CustomPipeBox();

		pipeBox.write('foo');
		pipeBox.end('bar');

		return collect(inputStream)
			.then( function(data) {
				expect(data.toString()).toBe('foobar');
			} );

	} );

	it( 'reads data from _outputStream (using options)', function() {

		var outputStream = new stream.PassThrough();

		var pipeBox = new PipeBox( { outputStream: outputStream } );

		outputStream.write('foo');
		outputStream.end('bar');

		return collect(pipeBox)
			.then( function(data) {
				expect(data.toString()).toBe('foobar');
			} );

	} );

	it( 'reads data from _outputStream (using a constructor)', function() {

		var outputStream = new stream.PassThrough();

		var CustomPipeBox = function() {
			this._outputStream = outputStream;
			PipeBox.call(this);
		};

		util.inherits( CustomPipeBox, PipeBox );

		var pipeBox = new CustomPipeBox();

		outputStream.write('foo');
		outputStream.end('bar');

		return collect(pipeBox)
			.then( function(data) {
				expect(data.toString()).toBe('foobar');
			} );

	} );

	if ( stream.Writable.prototype.cork ) {

		// There is no cork method in Node 0.10

		it( 'pauses writing if the _inputStream becomes corked and resumes when uncorked', function() {

			var inputStream = new stream.PassThrough();

			var spy = sinon.spy(inputStream ,'_transform');

			var pipeBox = new PipeBox( { inputStream: inputStream } );

			// Write and check the write worked
			pipeBox.write('test');
			expect( inputStream.read(4).toString() ).toBe('test');
			expect( spy.calledOnce ).toBe( true ); 

			// Cork
			inputStream.cork();

			// Write and check the write doesn't get through
			pipeBox.write('test');
			expect( inputStream.read(4) ).toBe(null);
			expect( spy.calledTwice ).toBe( false ); 

			// Uncork and see if the data comes through
			inputStream.uncork();
			expect( inputStream.read(4).toString() ).toBe('test');
			expect( spy.calledTwice ).toBe( true ); 

			// Write again
			pipeBox.write('test');
			expect( inputStream.read(4).toString() ).toBe('test');

		} );

	}

	it( 'works with object streams as well', function() {

		var passThrough = new stream.PassThrough( {objectMode: true } );
		var pipeBox = new PipeBox( { inputStream: passThrough, outputStream: passThrough, objectMode: true } );
		var ob = {};
		pipeBox.end( ob );

		return collect(pipeBox)
			.then( function(data) {
				expect(data[0]).toBe(ob);
			} );

	} );

} );
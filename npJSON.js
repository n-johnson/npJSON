/*!
 * npJSON v0.0.1
 * Author: Nathan Johnson <node@njohnson.me>
 * License: MIT Licensed
 *
 * File: npJSON.js
 */

var fs = require("fs");

/**
 * [npJSON]
 * @param  {[string]} fileName [file where data is stored]
 */
var npJSON = function(fileName) {
	if(typeof fileName === 'undefined' || fileName === '')
		throw "ERROR: filename given to npJSON was empty.";
	this.fileName = fileName;
	this.loaded = false;
	this._writeLock = true; //writeLock until data is loaded in _loadData()
	this._writeDelayedData = null;
	this._initialize();
};

/**
 * [_initialize - opens stream to fileName; creates file if doesn't exist ]
 *  @private
 */
npJSON.prototype._initialize = function() {
	if(!fs.existsSync(this.fileName)) { //Create the database
		var tempFile = fs.openSync(this.fileName, "w"), //Open and write {} to create a (blank) valid JSON object
			tempBuffer = new Buffer('{}');
		fs.writeSync(tempFile,tempBuffer,0,2,0);
		fs.closeSync(tempFile);
	}
		this.storageFile = fs.readFileSync(this.fileName); //Syncronous because we DO want this to be a blocking event.
};

/**
 * [_readFile - Reads data stream ]
 * @private
 * @return {[string]} [Returns the file as a utf-8 string]
 */
npJSON.prototype._readFile = function() {
	var fileStats = fs.statSync(this.fileName); //Load file stats to determine bytes to read
	this.fileSize = fileStats.size;
	var fileContents = new Buffer(this.fileSize); //Create a buffer to load file contents into
	var filePosition = 0, //Start at 0, this leaves room to create indexes in the future
		bytesToRead = 512; //How many bytes to read per iteration. What is the ideal number???

	while (filePosition < this.fileSize) {
		bytesToRead = ((filePosition + bytesToRead) > this.fileSize) ? (this.fileSize - filePosition) : bytesToRead; //Ensure we don't attempt to read more bytes than actually exist
		fs.readSync(this.storageFile, fileContents, filePosition, bytesToRead, filePosition); //Pushes data to buffer
		filePosition += bytesToRead;
	}
	var rData = fileContents.toString('utf8', 0, this.fileSize);

	return rData;
};

/**
 * [_writeFile - Writes updated data to file]
 * @param  {[object]} newData [The data to be written]
 * @param  {[function]} [optionalCallBack] [Used with writeDelayedData to reset]
 * @private
 * @note Data should be stored in object before it is written to a file to ensure that if any changes occur while updating they are still written to memory, and thus only the last change needs to be written to file, as it will contain data from all the previous changes
 */
npJSON.prototype._writeFile = function(newData) {
	if (!this.loaded)
		throw "ERROR: npJSON._writeFile() was called before any data was loaded.";
	var stringToWrite = JSON.stringify(newData),
		dataBuffer = new Buffer(stringToWrite),
		that = this;

	if(this._writeLock) { //Already writing data, wait until complete
		this._writeDelayedData = JSON.stringify(newData); //We are storing it as a JSON string because we need to delete the data before we try to write the file in case any new data comes in while the data is being written, and if we used an object, we would have to duplicate it, and this is more reliable
	}

	this._writeLock = true; //Prevent npJSON from trying to access file again until current write is complete
	fs.write(this.storageFile, dataBuffer, 0, stringToWrite.length, 0, function(err, written, buffer) {
		if (err)
			throw err;
		if(that._writeDelayedData !== null) { //Data to write has piled up, lets process it
			var latestData = that._writeDelayedData;
			that._writeDelayedData = null;
			that._writeFile(JSON.parse(that._writeDelayedData)); //For simplicity sake just using JSON as opposed to duplicating objects. TODO: test to ensure this isn't as much of a performance hit as duplicating large objects would be
		}
		that._writeLock = false;
	});
};

/**
 * [_loadData - Creates an object representation of the string returned in _readFile()]
 * @private
 */
npJSON.prototype._loadData = function() {
	var rawContents = this._readFile();
	try {
		this._rawObject = JSON.parse(rawContents);
	} catch(e) {
		throw "ERROR: npJSON: specified file does not contain valid JSON data";
	}
	this.loaded = true;
	this._writeLock = false;
};

npJSON.prototype.getValue = function(key) {
	if(!this.loaded)
		throw "ERROR: npJSON.getValue() was called before any data was loaded.";
	if(typeof this._rawObject[key] !== 'undefined') //Check existance of object before returning it
		return this._rawObject[key];
	return null;
};

npJSON.prototype.updateValue = function(key, value) {
	if(!this.loaded)
		throw "ERROR: npJSON.updateValue() was called before any data was loaded.";
	this.setValue(key,value,true);
};

npJSON.prototype.setValue = function(key, value, overWrite) {
	overWrite = overWrite || false;
	if(!overWrite) {
		if(this.getValue(key) !== null)
			throw "ERROR: npJSON: Attempted to overwrite data, make sure updateValue() is used instead of setValue for already written data";
	}
	if(!this.loaded)
		throw "ERROR: npJSON.setValue() was called before any data was loaded.";
	this._rawObject[key] = value; //Add to memory
	this._writeFile(this._rawObject); //Write it to file
};

npJSON.prototype.removeValue = function(key) {
	if(!this.loaded)
		throw "ERROR: npJSON.removeValue() was called before any data was loaded.";
	delete this._rawObject[key];
	this._writeFile(this._rawObject); //Write it to file
};

module.exports = function(fileName) {
	return new npJSON(fileName);
};
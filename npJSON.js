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
 * @param  {[boolean]} justRead [OPTIONAL: If true, will close data stream after data is loaded.]
 */
var npJSON = function(fileName, justRead) {
	if(typeof fileName === 'undefined' || fileName === '')
		throw "ERROR: filename given to npJSON was empty.";
	this.justRead = justRead || false;
	this.fileName = fileName;
	this.loaded = false;
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
	if(this.justRead)
		this.storageFile = fs.openSync(this.fileName, "r"); //r+ = Reading and writing | Open files, whether new or old
	else
		this.storageFile = fs.openSync(this.fileName, "r+"); //r+ = Reading and writing | Open files, whether new or old
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
	if(this.justRead)
		this.close();
	return rData;
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
};

npJSON.prototype.getValue = function(key) {
	if(!this.loaded)
		throw "ERROR: npJSON.getValue() was called before any data was loaded.";
	//TODO
};

npJSON.prototype.setValue = function(key, value) {
	if(!this.loaded)
		throw "ERROR: npJSON.getValue() was called before any data was loaded.";
	//TODO
};

npJSON.prototype.updateValue = function(key, value) {
	if(!this.loaded)
		throw "ERROR: npJSON.getValue() was called before any data was loaded.";
	//TODO
};

npJSON.prototype.close = function() {
	fs.closeSync(this.storageFile);
};

module.exports = function(fileName) {
	return new npJSON(fileName);
};
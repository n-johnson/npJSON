/*!
 * npJSON v1.0.0
 * Author: Nathan Johnson <node@njohnson.me>
 * License: MIT Licensed
 *
 * File: npJSON.js
 */

var fs = require("fs");

/**
 * npJSON
 * @param  {string} fileName - file where data is stored
 */
var npJSON = function(fileName) {
	if (typeof fileName === 'undefined' || fileName === '')
		throw "ERROR: filename given to npJSON was empty.";
	this.fileName = fileName;
	this.loaded = false;
	this._writeLock = true; //writeLock until data is loaded in _loadData()
	this._writeDelayedData = null;
	this._initialize();
};

/**
 * _initialize - opens fileName; creates file if doesn't exist
 *  @private
 */
npJSON.prototype._initialize = function() {
	if (!fs.existsSync(this.fileName)) {
		var tempFile = fs.openSync(this.fileName, "w"), //Open and write {} to create a (blank) valid JSON object
			tempBuffer = new Buffer('{}');
		fs.writeSync(tempFile, tempBuffer, 0, 2, 0);
		fs.closeSync(tempFile);
	}
	this._loadData();
};

/**
 * _readFile - Reads data
 * @private
 * @return {string} - Returns the file as a utf-8 string
 */
npJSON.prototype._readFile = function() {
	return fs.readFileSync(this.fileName); //Syncronous because we DO want this to be a blocking event.
};

/**
 * _loadData - Creates an object representation of the string returned in _readFile()
 * @private
 */
npJSON.prototype._loadData = function() {
	var rawContents = this._readFile();
	try {
		this._rawObject = JSON.parse(rawContents);
	} catch (e) {
		throw "ERROR: npJSON: specified file does not contain valid JSON data";
	}
	this.loaded = true;
	this._writeLock = false;
};

/**
 * _writeFile - Writes updated data to file
 * @param  {object} newData - The data to be written
 * @param  {function} optionalCallBack - Used with writeDelayedData to reset
 * @private
 */
npJSON.prototype._writeFile = function(newData, callBack) {
	callBack = callBack || function() {};
	if (!this.loaded)
		throw "ERROR: npJSON._writeFile() was called before any data was loaded.";
	var stringToWrite = JSON.stringify(newData),
		that = this;

	if (this._writeLock) {
		this._writeDelayedData = JSON.stringify(newData); //We are storing it as a JSON string because we need to delete the data before we try to write the file in case any new data comes in while the data is being written, and if we used an object, we would have to duplicate it, and this is more reliable
	}

	this._writeLock = true; //Prevent npJSON from trying to access file again until current write is complete
	fs.writeFile(this.fileName, stringToWrite, function(err) {
		if (err)
			throw err;
		if (that._writeDelayedData !== null) {
			var latestData = that._writeDelayedData;
			that._writeDelayedData = null;
			that._writeFile(JSON.parse(latestData)); //For simplicity sake just using JSON as opposed to duplicating objects. TODO: test to ensure this isn't as much of a performance hit as duplicating large objects would be
		}
		that._writeLock = false;
		callBack(); //Issue callback
	});
};

/**
 * forceReload - Reloads data from file, destroying what was in memory.
 *               Possible to lose data if it hadn't been written, use with caution
 */
npJSON.prototype.forceReload = function() {
	this._writeLock = true; //Don't let anything new be added to prevent data loss
	this._rawObject = {};
	this._loadData();
};

/**
 * getValue - Returns value of a given key
 * @param  {string} key
 * @return {any} - Value of given key
 */
npJSON.prototype.getValue = function(key) {
	if (!this.loaded)
		throw "ERROR: npJSON.getValue() was called before any data was loaded.";
	if (typeof this._rawObject[key] !== 'undefined')
		return this._rawObject[key];
	return null;
};

/**
 * updateValue - Updates an existing value by a given key
 *               If value doesn't exist, will create it.
 * @param  {string} key
 * @param  {any} value
 * @param {function} callBack - OPTIONAL: Called after data is written to file. No parameters set.
 */
npJSON.prototype.updateValue = function(key, value, callBack) {
	callBack = callBack || function() {};
	if (!this.loaded)
		throw "ERROR: npJSON.updateValue() was called before any data was loaded.";
	this.setValue(key, value, callBack, true);
};

/**
 * setValue - Sets a value for a key
 *            Will throw exception if key already exists. Use updateValue for existing keys.
 * @param {string} key
 * @param {any} value
 * @param {function} callBack - OPTIONAL: Called after data is written to file. No parameters set.
 * @param {boolean} _overWrite - OPTIONAL: Only should be used by updateValue. Leave blank.
 */
npJSON.prototype.setValue = function(key, value, callBack, _overWrite) {
	_overWrite = _overWrite || false;
	callBack = callBack || function() {};
	if (!_overWrite) {
		if (this.getValue(key) !== null)
			throw "ERROR: npJSON: Attempted to overwrite data, make sure updateValue() is used instead of setValue for already written data";
	}
	if (!this.loaded)
		throw "ERROR: npJSON.setValue() was called before any data was loaded.";
	this._rawObject[key] = value;
	this._writeFile(this._rawObject, callBack);
};

/**
 * setValues - Sets many values at once.
 * @param {array} arrayOfArrays - Data should be in the form [[key,value],[key,value],[key,value],etc]
 * @param {function} callBack - OPTIONAL: Called after data is written to file. No parameters set.
 */
npJSON.prototype.setValues = function(arrayOfArrays, callBack) {
	callBack = callBack || function() {};
	if (!this.loaded)
		throw "ERROR: npJSON.setValue() was called before any data was loaded.";
	for (var i = 0; i < arrayOfArrays.length; i++) {
		this._rawObject[arrayOfArrays[i][0]] = arrayOfArrays[i][1]; //Add to memory
	}
	this._writeFile(this._rawObject, callBack); //Write it to file
};

/**
 * removeValue - Removes a KV pair from data set
 * @param  {string} key - key to remove
 * @param {function} callBack - OPTIONAL: Called after data is written to file. No parameters set.
 */
npJSON.prototype.removeValue = function(key, callBack) {
	callBack = callBack || function() {};
	if (!this.loaded)
		throw "ERROR: npJSON.removeValue() was called before any data was loaded.";
	delete this._rawObject[key];
	this._writeFile(this._rawObject, callBack);
};

module.exports = function(fileName) {
	return new npJSON(fileName);
};
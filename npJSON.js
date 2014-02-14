/*!
 * npJSON v0.0.1
 * Author: Nathan Johnson <node@njohnson.me>
 * License: MIT Licensed
 *
 * File: npJSON.js
 */

var fs = require("fs");

var npJSON = function(fileName) {
	this.fileName = fileName;
};

module.exports = function(fileName) {
	return new npJSON(fileName);
};
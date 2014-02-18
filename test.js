/*!
 * npJSON v1.0.0
 * Author: Nathan Johnson <node@njohnson.me>
 * License: MIT Licensed
 *
 * File: test.js
 */

//Create test file with random name - initialize
var filename = 'test.' + getRandomText(5, 6);
var file = require("./npJSON")(filename);
var fs = require("fs");

console.log('Begin testing. Using file: ' + filename);
test1(); //Begin chain of tests.

//Write data to it
//Ensure we are using all data types
function test1() {
	file.setValue("abc", 123, function() {
		file.setValue("123", 'abc', function() {
			file.setValue("t", true, function() {
				file.setValue("f", false, function() {
					file.setValue("obj", {
						"inner_abc": 123,
						"inner_123": "abc",
						"inner_t": true,
						"inner_f": false
					}, function() {
						check1();
					});
				});
			});
		});
	});
}

//Let's check the data
function check1() {
	file.forceReload();

	var tmp1 = file.getValue("abc");
	if (tmp1 !== 123)
		throw "Error: check1.tmp1";
	var tmp2 = file.getValue("123");
	if (tmp2 !== 'abc')
		throw "Error: check1.tmp2";
	var tmp3 = file.getValue("t");
	if (tmp3 !== true)
		throw "Error: check1.tmp3";
	var tmp4 = file.getValue("f");
	if (tmp4 !== false)
		throw "Error: check1.tmp4";
	var tmp5 = file.getValue("obj");
	var tmp5obj = {
		"inner_abc": 123,
		"inner_123": "abc",
		"inner_t": true,
		"inner_f": false
	};
	if (JSON.stringify(tmp5) !== JSON.stringify(tmp5obj))
		throw "Error: check1.tmp5";

	console.log("Check 1 passed. Data types written and read successfully.");
	test2();
}

function test2() {
	var testArray = [
		['s1', 'abc'],
		['s2', 123],
		['s3', false]
	];
	file.setValues(testArray, check2);
}

function check2() {
	file.forceReload();
	var tmp1 = file.getValue("s1");
	if (tmp1 !== 'abc')
		throw "Error: check2.tmp1";
	var tmp2 = file.getValue("s2");
	if (tmp2 !== 123)
		throw "Error: check2.tmp2";
	var tmp3 = file.getValue("s3");
	if (tmp3 !== false)
		throw "Error: check2.tmp3";
	console.log("Check 2 passed. setValues() function works as expected.");
	test3();
}

//Remove, update, change, etc data, and verify it exists as expected
function test3() {
	file.updateValue('abc', 456, function() {
		file.updateValue('t', false, function() {
			file.removeValue("123", function() {
				check3();
			});
		});
	});
}

function check3() {
	file.forceReload();

	var tmp1 = file.getValue("abc");
	if (tmp1 !== 456)
		throw "Error: check3.tmp1";
	var tmp2 = file.getValue("t");
	if (tmp2 !== false)
		throw "Error: check3.tmp2";
	var tmp3 = file.getValue("123");
	if (tmp3 !== null)
		throw "Error: check3.tmp3";
	console.log("Check 3 passed. Update and and delete is working.");
	finish();
}

function finish() {
	console.log("All tests pass. Code appears to be working as desired!. Deleteing test file now.");
	deleteFile();
}

//Remove file when complete
function deleteFile() {
	fs.unlink(filename, function(err) {
		if (err)
			throw err;
		console.log('File successfully deleted.');
	});
}

//Random functions
function getRandomText(numberOfCharactersLow, numberOfCharactersHigh) {
	var numbChar = getRandomInt(numberOfCharactersLow, numberOfCharactersHigh);
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
	var returnText = '';
	for (var i = 0; i < numbChar; i++) {
		returnText += possible.charAt(getRandomInt(0, 62));
	}
	return returnText;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
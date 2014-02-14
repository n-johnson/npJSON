var file = require("./npJSON")('test');

console.log(file);
console.log(typeof file.storageFile);

var data = file._loadData();

console.log(file._rawObject);

if(file._rawObject.testBool)
console.log('t');
else
console.log('f');

file.close();
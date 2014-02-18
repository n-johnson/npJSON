var file = require("./npJSON")('test');
var data = file._loadData();

//console.log(file._rawObject);

console.log(file.getValue('a'));

//file.setValue('b','123');
file.updateValue('b','456');


file.close();
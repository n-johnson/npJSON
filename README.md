npJSON
======

'Node.js Persistant JSON' Storage

npJSON is an extremely simple KV data store without the weight of a traditional database (SQL or noSQL). It only provides methods for setting, retrieving, updating, and deleting data. This is not suitable for all applications, but it works well for simple applications that don't require a more robust KV store.

Data is stored as a JSON object in a customizable file.

##Usage

###Initialize

``` js
var npJSON = require("./npJSON")(fileName);
```

###Methods

getValue - Returns value of a given key

``` js
npJSON.getValue(key);
```

updateValue - Updates an existing value by a given key. If value doesn't exist, will create it. Callback is optional.

``` js
npJSON.updateValue(key, value, callBack);
```

setValue - Sets a value for a key. Will throw exception if key already exists. Use updateValue for existing keys. Callback optional.

``` js
npJSON.setValue(key, value, callBack);
```

setValues - Sets many values at once. Data should be in the form [[key,value],[key,value],[key,value],etc] Callback optional.

``` js
npJSON.setValues(arrayOfArrays, callBack);
```

removeValue - Removes a KV pair from data set. Callback optional.

``` js
npJSON.removeValue(key, callBack);
```

forceReload - Reloads data from file, destroying what was in memory. Possible to lose data if it hadn't been written, use with caution.

``` js
npJSON.forceReload();
```
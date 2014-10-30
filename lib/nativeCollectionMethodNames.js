'use strict';

var getMethodNames = require('method-names'),
    mongodb = require('mongodb');

function getNativeCollectionMethodNames() {
    var dummyNativeDb = { options: {}, serverConfig: { options: {} } },
        nativeCollection = new mongodb.Collection(dummyNativeDb, 'anyCollectionName');

    return getMethodNames(nativeCollection);
}

module.exports = getNativeCollectionMethodNames();

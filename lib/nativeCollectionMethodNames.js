'use strict';

var getMethodNames = require('method-names'),
    mongodb = require('mongodb');

function getNativeCollectionMethodNames() {
    var dummyNativeDb = { options: {} },
        nativeCollection = new mongodb.Collection(dummyNativeDb, null, '', 'anyCollectionName', null, {});

    return getMethodNames(nativeCollection);
}

module.exports = getNativeCollectionMethodNames();

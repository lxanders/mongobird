'use strict';

var _ = require('lodash'),
    Promise = require('bluebird'),
    methodNames = require('./nativeCollectionMethodNames'),
    collections = Object.create(null);

function ensureCollection(db, collectionName) {
    var hash = db.connectionString + collectionName;

    if (collections[hash]) {
        return Promise.resolve(collections[hash]);
    }

    return db.ensureConnection(db.connectionString)
        .then(function (nativeConnection) {
            var getNativeCollection = Promise.promisify(nativeConnection.collection, nativeConnection);
            return getNativeCollection(collectionName);
        })
        .tap(function (nativeCollection) {
            collections[hash] = nativeCollection;
        });
}

function createCollectionMethod(db, collectionName, collection, methodName) {
    collection[methodName] = function () {
        var args = _.toArray(arguments);

        return Promise.try(ensureCollection.bind(null, db, collectionName))
            .then(function (nativeCollection) {
                var promisifiedMethod = Promise.promisify(nativeCollection[methodName], nativeCollection);
                return promisifiedMethod.apply(null, args);
            });
    };

    return collection;
}

function getCollection(db, collectionName) {
    return methodNames.reduce(createCollectionMethod.bind(null, db, collectionName), {});
}

module.exports = {
    getCollection: getCollection
};

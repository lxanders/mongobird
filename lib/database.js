'use strict';

var Promise = require('bluebird'),
    mongoUri = require('./mongoUri'),
    collection = require('./collection'),
    mongodb = require('mongodb'),
    connections = Object.create(null);

function ensureConnection(connectionString) {
    var MongoClient = mongodb.MongoClient,
        connect = Promise.promisify(MongoClient.connect);

    if (connections[connectionString]) {
        return Promise.resolve(connections[connectionString]);
    }

    return connect(connectionString)
        .tap(function (connection) {
            connections[connectionString] = connection;
        });
}

function getDb(connectionInformation, dbName) {
    var connectionString = mongoUri.format(connectionInformation, dbName),
        information = Object.freeze(mongoUri.parse(connectionString)),
        db = {
            connectionString: connectionString,
            ensureConnection: ensureConnection.bind(null, connectionString)
        };

    Object.defineProperty(db, 'information', {
        configurable: false,
        writable: false,
        enumerable: true,
        value: information
    });
    db.getCollection = collection.getCollection.bind(null, db);

    return db;
}

module.exports = {
    getDb: getDb
};

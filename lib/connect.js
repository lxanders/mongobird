'use strict';

var _ = require('underscore'),
    mongoUri = require('./mongoUri'),
    database = require('./database');

module.exports = function connect(connectionString) {
    var connection = {},
        information = Object.freeze(_.omit(mongoUri.parse(connectionString), 'db'));

    Object.defineProperty(connection, 'information', {
        configurable: false,
        writable: false,
        enumerable: true,
        value: information
    });
    connection.getDb = database.getDb.bind(null, _.extend({}, connection.information));

    return connection;
};

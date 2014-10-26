'use strict';

var _ = require('underscore'),
    mongoUri = require('./mongoUri');

function getDb(connectionInformation, dbName) {
    var connectionString = mongoUri.format(connectionInformation, dbName);

    return {
        information: mongoUri.parse(connectionString),
        connectionString: connectionString
    };
}

module.exports = function connect(connectionString) {
    var connection = {};

    connection.information = _.omit(mongoUri.parse(connectionString), 'db');
    connection.getDb = getDb.bind(null, _.extend({}, connection.information));

    connection.information = Object.freeze(connection.information);
    connection = Object.freeze(connection);

    return connection;
};

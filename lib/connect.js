'use strict';

var _ = require('underscore'),
    mongoUri = require('./mongoUri'),
    database = require('./database');

module.exports = function connect(connectionString) {
    var connection = {};

    connection.information = _.omit(mongoUri.parse(connectionString), 'db');
    connection.getDb = database.getDb.bind(null, _.extend({}, connection.information));

    connection.information = Object.freeze(connection.information);
    connection = Object.freeze(connection);

    return connection;
};

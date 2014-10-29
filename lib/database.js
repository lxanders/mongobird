'use strict';

var mongoUri = require('./mongoUri');

function getDb(connectionInformation, dbName) {
    var connectionString = mongoUri.format(connectionInformation, dbName);

    return {
        information: mongoUri.parse(connectionString),
        connectionString: connectionString
    };
}

module.exports = {
    getDb: getDb
};

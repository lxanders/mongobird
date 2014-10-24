'use strict';

var stringUtils = require('beltjs').string,
    parseMongoUri = require('muri'),
    _ = require('underscore');

function prependMongodbIdentifier(connectionString) {
    var mongodbIdentifier = 'mongodb://';

    if (!stringUtils.startsWith(connectionString, mongodbIdentifier)) {
        connectionString = mongodbIdentifier + connectionString;
    }

    return connectionString;
}

function formatOption(option, optionKey) {
    return optionKey + '=' + option;
}

function formatOptions(options) {
    var formattedOptions = _.map(options, formatOption),
        optionsString = '';

    if (formattedOptions.length > 0) {
        optionsString = '?' + formattedOptions.join('&');
    }

    return optionsString;
}

function formatDbName(dbName) {
    if (!dbName || typeof dbName !== 'string' || dbName.length === 0) {
        throw new Error('Invalid database name provided. Information: ' + dbName);
    }

    return '/' + dbName;
}

function formatHost(host) {
    return host.host + ':' + host.port;
}

function formatHosts(hosts) {
    var formattedHosts;

    if (hosts.length <= 0) {
        throw new Error('Invalid connection information: No hosts provided. Information: ' + hosts);
    }

    formattedHosts = hosts.map(function (host) {
        return formatHost(host);
    });

    return formattedHosts.join(',');
}

function formatCredentials(credentials) {
    var credentialsString = '';

    if (credentials) {
        credentialsString = credentials.user + ':' + credentials.pass + '@';
    }

    return credentialsString;
}

function formatConnectionString(connectionInformation, dbName) {
    var connectionString = 'mongodb://';

    connectionString += formatCredentials(connectionInformation.auth);
    connectionString += formatHosts(connectionInformation.hosts);
    connectionString += formatDbName(dbName);
    connectionString += formatOptions(connectionInformation.options);

    return connectionString;
}

function getDb(connectionInformation, dbName) {
    var connectionString = formatConnectionString(connectionInformation, dbName);

    return {
        information: parseMongoUri(connectionString),
        connectionString: connectionString
    };
}

module.exports = function connect(connectionString) {
    var connection = {};

    connectionString = prependMongodbIdentifier(connectionString);

    connection.information = _.omit(parseMongoUri(connectionString), 'db');
    connection.getDb = getDb.bind(null, _.extend({}, connection.information));

    connection.information = Object.freeze(connection.information);
    connection = Object.freeze(connection);

    return connection;
};

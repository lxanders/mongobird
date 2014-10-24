'use strict';

var stringUtils = require('beltjs').string,
    muri = require('muri'),
    _ = require('underscore');

function prependMongodbIdentifier(connectionString) {
    var mongodbIdentifier = 'mongodb://';

    if (!stringUtils.startsWith(connectionString, mongodbIdentifier)) {
        connectionString = mongodbIdentifier + connectionString;
    }

    return connectionString;
}

function formatOption(options, optionKey) {
    return optionKey + '=' + options[optionKey];
}

function formatOptions(connectionInformation) {
    var options = connectionInformation.options,
        optionsString = '',
        optionKeys,
        optionString,
        i;

    if (options) {
        optionKeys = Object.keys(options);

        if (optionKeys.length > 0) {
            optionString = formatOption(options, optionKeys[0]);
            optionsString = '?' + optionString;

            if (optionKeys.length > 1) {
                for (i = 1; i < optionKeys.length; i += 1) {
                    optionsString += '&' + formatOption(options, optionKeys[i]);
                }
            }
        }
    }

    return optionsString;
}

function formatDbName(dbName) {
    if (!dbName || dbName.length === 0) {
        throw new Error('Invalid database name provided. Information: ' + dbName);
    }

    return '/' + dbName;
}

function formatHost(host) {
    return host.host + ':' + host.port;
}

function formatHosts(connectionInformation) {
    var hosts = connectionInformation.hosts,
        hostsString,
        i;

    if (hosts.length > 0) {
        hostsString = formatHost(hosts[0]);

        if (hosts.length > 1) {
            for (i = 1; i < hosts.length; i += 1) {
                hostsString += ',' + formatHost(hosts[i]);
            }
        }
    } else {
        throw new Error('Invalid connection information: No hosts provided. Information: ' + connectionInformation);
    }

    return hostsString;
}

function formatCredentials(connectionInformation) {
    var credentials = connectionInformation.auth,
        credentialsString = '';

    if (credentials) {
        credentialsString = credentials.user + ':' + credentials.pass + '@';
    }

    return credentialsString;
}

function formatConnectionString(connectionInformation, dbName) {
    var connectionString = 'mongodb://';

    connectionString += formatCredentials(connectionInformation);
    connectionString += formatHosts(connectionInformation);
    connectionString += formatDbName(dbName);
    connectionString += formatOptions(connectionInformation);

    return connectionString;
}

function getDb(connectionInformation, dbName) {
    var connectionString = formatConnectionString(connectionInformation, dbName);

    return {
        information: muri(connectionString),
        connectionString: connectionString
    };
}

module.exports = function connect(connectionString) {
    var connection = {};

    connectionString = prependMongodbIdentifier(connectionString);

    connection.information = _.omit(muri(connectionString), 'db');
    connection.getDb = getDb.bind(null, _.extend({}, connection.information));

    connection.information = Object.freeze(connection.information);
    connection = Object.freeze(connection);

    return connection;
};

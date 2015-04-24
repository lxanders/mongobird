'use strict';

var _ = require('lodash'),
    parseMongoUri = require('muri');

function prependMongodbIdentifier(connectionString) {
    var mongodbIdentifier = 'mongodb://',
        connectionStringWithMongoDbIdentifier = connectionString;

    if (!_.startsWith(connectionString, mongodbIdentifier)) {
        connectionStringWithMongoDbIdentifier = mongodbIdentifier + connectionString;
    }

    return connectionStringWithMongoDbIdentifier;
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
    if (!hosts || !_.isArray(hosts) || hosts.length <= 0) {
        throw new Error('Invalid connection information: No hosts provided. Information: ' + hosts);
    }

    return hosts.map(formatHost).join(',');
}

function formatCredentials(credentials) {
    var credentialsString = '';

    if (credentials) {
        credentialsString = credentials.user + ':' + credentials.pass + '@';
    }

    return credentialsString;
}

function format(connectionInformation, dbName) {
    var connectionString = 'mongodb://';

    connectionString += formatCredentials(connectionInformation.auth);
    connectionString += formatHosts(connectionInformation.hosts);
    connectionString += formatDbName(dbName);
    connectionString += formatOptions(connectionInformation.options);

    return connectionString;
}

function parse(connectionString) {
    if (!connectionString || typeof connectionString !== 'string' || connectionString.length === 0) {
        throw new Error('Invalid connection string. Provided connection string: ' + connectionString);
    }

    return parseMongoUri(prependMongodbIdentifier(connectionString));
}

module.exports = {
    format: format,
    parse: parse
};

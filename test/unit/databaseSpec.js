'use strict';

var expect = require('chai').expect,
    connect = require('../../lib/connect');

describe('database getDb', function () {
    var connectionString = 'user:pass@host,different:1234/anyDB?any=true&no=1',
        connection;

    beforeEach(function () {
        connection = connect(connectionString);
    });

    it('should return a database representation with a valid connection string', function () {
        var dbName = 'interestingDb',
            expectedConnectionString = 'mongodb://user:pass@host:27017,different:1234/' + dbName + '?any=true&no=1';

        expect(connection.information).to.not.have.property('db');
        expect(connection.getDb(dbName).connectionString).to.equal(expectedConnectionString);
    });

    it('should throw an error if the database name is missing', function () {
        var expectedErrorMessage = 'Invalid database name provided. Information: ';

        expect(connection.getDb.bind(null, '')).to.throw(expectedErrorMessage);
        expect(connection.getDb).to.throw(expectedErrorMessage + 'undefined');
    });

    it('should throw an error if the database name is not a string', function () {
        var expectedErrorMessage = 'Invalid database name provided. Information: ';

        expect(connection.getDb.bind(null, [ 'an', 'array' ])).to.throw(expectedErrorMessage);
    });

    it('should throw an error if connection information data is modified', function () {
        var expectedErrorMessage = 'Cannot assign to read only property',
            changeConnection = function () {
                connection.information = {};
            },
            changeHosts = function () {
                connection.information.hosts = [];
            },
            changeGetDb = function () {
                connection.getDb = function () {};
            };

        expect(changeConnection).to.throw(expectedErrorMessage);
        expect(changeHosts).to.throw(expectedErrorMessage);
        expect(changeGetDb).to.throw(expectedErrorMessage);
    });

    it('should throw an error if the connection object gets extended', function () {
        var expectedErrorMessage = 'Can\'t add property something, object is not extensible',
            addProperty = function () {
                connection.something = 'new';
            };

        expect(addProperty).to.throw(expectedErrorMessage);
    });
});

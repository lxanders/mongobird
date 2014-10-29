'use strict';

var chai = require('chai'),
    expect = chai.expect,
    mongodb = require('mongodb'),
    sinon = require('sinon'),
    database = require('../../lib/database');

chai.use(require('sinon-chai'));

describe('database', function () {
    var getDb,
        connectionInformation = {
            hosts: [
                { host: 'host', port: 27017 },
                { host: 'different', port: 1234 }
            ],
            options: {
                any: true,
                no: 1
            },
            auth: {
                user: 'user',
                pass: 'pass'
            }
        };

    beforeEach(function () {
        getDb = database.getDb.bind(null, connectionInformation);
    });

    describe('getDb', function () {
        it('should return a database representation with a valid connection string', function () {
            var dbName = 'interestingDb',
                expectedConnectionString = 'mongodb://user:pass@host:27017,different:1234/' + dbName + '?any=true&no=1';

            expect(getDb(dbName).connectionString).to.equal(expectedConnectionString);
        });

        it('should throw an error if the database name is missing', function () {
            var expectedErrorMessage = 'Invalid database name provided. Information: ';

            expect(getDb.bind(null, '')).to.throw(expectedErrorMessage);
            expect(getDb).to.throw(expectedErrorMessage + 'undefined');
        });

        it('should throw an error if the database name is not a string', function () {
            var expectedErrorMessage = 'Invalid database name provided. Information: ';

            expect(getDb.bind(null, [ 'an', 'array' ])).to.throw(expectedErrorMessage);
        });

        it('should throw an error if connection information of the db is modified', function () {
            var expectedErrorMessage = 'Cannot assign to read only property',
                db = getDb('anyDb'),
                changeInformation = function () {
                    db.information = {};
                },
                changeDb = function () {
                    db.information.db = 'otherDb';
                };

            expect(changeInformation).to.throw(expectedErrorMessage);
            expect(changeDb).to.throw(expectedErrorMessage);
        });
    });

    describe('ensureConnection', function () {
        var db,
            connect;

        beforeEach(function () {
            db = getDb('anyDb');
            connect = sinon.stub(mongodb.MongoClient, 'connect');
            connect.yields(null, {});
        });

        afterEach(function () {
            connect.restore();
        });

        it('should establish a connection only once', function () {
            var connection;

            return db.ensureConnection(db.connectionString)
                .then(function (firstConnection) {
                    expect(connect).to.have.been.calledOnce
                        .and.to.have.been.calledWith(db.connectionString);

                    connect.reset();
                    connection = firstConnection;
                })
                .then(db.ensureConnection.bind(null, db.connectionString))
                .then(function (secondConnection) {
                    expect(connect).not.to.have.been.called;
                    expect(secondConnection).to.equal(connection);
                });
        });
    });
});

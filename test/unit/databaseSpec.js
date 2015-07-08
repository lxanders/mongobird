'use strict';

var chai = require('chai'),
    expect = chai.expect,
    mongodb = require('mongodb'),
    sinon = require('sinon'),
    Promise = require('bluebird'),
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
            connect.yields(null, { close: sinon.stub().yields() });
        });

        afterEach(function (done) {
            connect.restore();
            database.close().nodeify(done);
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

    describe('closing connection', function () {
        var db,
            connect,
            connection;

        function buildDummyConnectionStringForDb(dbName) {
            return 'mongodb://user:pass@host:27017,different:1234/' + dbName + '?any=true&no=1';
        }

        beforeEach(function () {
            connect = sinon.stub(mongodb.MongoClient, 'connect');

            connection = { close: sinon.stub().yields() };

            connect.withArgs(buildDummyConnectionStringForDb('anyDb')).yields(null, connection);
            db = getDb('anyDb');
        });

        afterEach(function () {
            connect.restore();
        });

        it('should close a single database connection', function () {
            return db.ensureConnection(db.connectionString)
                .then(db.close)
                .then(function () {
                    expect(connection.close).to.have.been.calledOnce;
                });
        });

        it('should not close the same connection more than once', function () {
            return db.ensureConnection(db.connectionString)
                .then(db.close)
                .then(db.close)
                .then(function () {
                    expect(connection.close).to.have.been.calledOnce;
                });
        });

        it('should close every connection', function () {
            var otherDb,
                otherConnection = { close: sinon.stub().yields() };

            connect.withArgs(buildDummyConnectionStringForDb('otherDb')).yields(null, otherConnection);

            otherDb = getDb('otherDb');

            return Promise.join(
                    db.ensureConnection(db.connectionString),
                    otherDb.ensureConnection(otherDb.connectionString)
                )
                .then(database.close)
                .then(function () {
                    expect(connection.close).to.have.been.calledOnce;
                    expect(otherConnection.close).to.have.been.calledOnce;
                });
        });
    });
});

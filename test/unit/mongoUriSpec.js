'use strict';

var chai = require('chai'),
    expect = chai.expect,
    mongoUri = require('../../lib/mongoUri'),
    proxyquire = require('proxyquire'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('mongoUri', function () {
    describe('parse', function () {
        var muriStub,
            mongoUriWithMuriStub;

        beforeEach(function () {
            muriStub = sinon.stub();
            mongoUriWithMuriStub = proxyquire('../../lib/mongoUri', { muri: muriStub });
        });

        it('should call the parse dependency with the correct connection string', function () {
            var connectionString = 'mongodb://some:one@anyhost:1234/anyDb?any=thing';

            mongoUriWithMuriStub.parse(connectionString);

            expect(muriStub).to.have.been.calledOnce;
            expect(muriStub).to.have.been.calledWithExactly(connectionString);
        });

        it('should parse successfully if the mongodb identifier is missing', function () {
            var connectionString = 'some:one@anyhost:1234/anyDb?any=thing';

            mongoUriWithMuriStub.parse(connectionString);

            expect(muriStub).to.have.been.calledOnce;
            expect(muriStub).to.have.been.calledWithExactly('mongodb://' + connectionString);
        });
    });

    describe('format', function () {
        it('should format a complete connection information', function () {
            var connectionInformation = {
                    auth: { user: 'someone', pass: '123' },
                    hosts: [
                        { host: 'host1', port: 27017 },
                        { host: 'host2', port: 1234 }
                    ],
                    options: { any: 'thing', other: true }
                },
                dbName = 'anyDb',
                expectedConnectionString = 'mongodb://someone:123@host1:27017,host2:1234/anyDb?any=thing&other=true';

            expect(mongoUri.format(connectionInformation, dbName)).to.equal(expectedConnectionString);
        });

        it('should format connection information without credentials', function () {
            var connectionInformation = {
                    hosts: [
                        { host: 'host1', port: 27017 }
                    ],
                    options: { any: 'thing', other: true }
                },
                dbName = 'anyDb',
                expectedConnectionString = 'mongodb://host1:27017/anyDb?any=thing&other=true';

            expect(mongoUri.format(connectionInformation, dbName)).to.equal(expectedConnectionString);
        });

        it('should format connection information without options', function () {
            var connectionInformation = {
                    hosts: [
                        { host: 'host1', port: 27017 }
                    ]
                },
                dbName = 'anyDb',
                expectedConnectionString = 'mongodb://host1:27017/anyDb';

            expect(mongoUri.format(connectionInformation, dbName)).to.equal(expectedConnectionString);
        });

        describe('invalid hosts', function () {
            var testCases = [
                { hosts: '' },
                { hosts: null },
                { hosts: [] },
                { hosts: {} },
                {}
            ];

            testCases.forEach(function (testCase) {
                it('should throw an error if the hosts are invalid. hosts=' + testCase.hosts, function () {
                    var connectionInformation = { hosts: testCase.hosts },
                        format = mongoUri.format.bind(null, connectionInformation, 'anyDbName'),
                        additionalInformation = 'No hosts provided. Information: ' + connectionInformation.hosts,
                        expectedErrorMessage = 'Invalid connection information: ' + additionalInformation;

                    expect(format).to.throw(expectedErrorMessage);
                });
            });
        });

        describe('invalid database name', function () {
            var testCases = [
                { dbName: '' },
                { dbName: null },
                { dbName: [] },
                { dbName: [ 'not', 'empty', 'array' ] },
                { dbName: {} },
                {}
            ];

            testCases.forEach(function (testCase) {
                it('should throw an error if the db name is invalid. dbName=' + testCase.dbName, function () {
                    var expectedErrorMessage = 'Invalid database name provided. Information: ' + testCase.dbName,
                        connectionInformation = { hosts: [
                            { host: 'any', port: 27017 }
                        ] },
                        format = mongoUri.format.bind(null, connectionInformation, testCase.dbName);

                    expect(format).to.throw(expectedErrorMessage);
                });
            });
        });
    });
});

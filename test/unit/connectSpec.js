'use strict';

var expect = require('chai').expect,
    connect = require('../../lib/connect');

describe('connect', function () {
    var validTestCases = [
            {
                description: 'return a minimal connection object',
                input: 'anyhost',
                expectedConnection: {
                    hosts: [
                        { host: 'anyhost', port: 27017 }
                    ],
                    options: {}
                }

            },
            {
                description: 'ignore the database name and parse everything else',
                input: 'mongodb://anyuser:withpassword@anyhost:40000,different:1234,host3/anyDB?any=true&another=1',
                expectedConnection: {
                    auth: {
                        user: 'anyuser',
                        pass: 'withpassword'
                    },
                    hosts: [
                        {
                            host: 'anyhost',
                            port: 40000
                        },
                        {
                            host: 'different',
                            port: 1234
                        },
                        {
                            host: 'host3',
                            port: 27017
                        }
                    ],
                    options: {
                        another: 1,
                        any: true
                    }
                }
            }
        ],
        invalidTestCases = [
            {
                description: 'missing hostnames',
                input: '',
                expectedErrorMessage: 'Invalid mongodb uri. Missing hostname'
            }
        ];

    validTestCases.forEach(function (testCase) {
        it('should ' + testCase.description, function () {
            var connection = connect(testCase.input);

            expect(connection).to.have.property('getDb');
            expect(connection.getDb).to.be.a('function');
            expect(connection.information).to.deep.equal(testCase.expectedConnection);
        });
    });

    invalidTestCases.forEach(function (testCase) {
        it('should throw an error for ' + testCase.description, function () {
            expect(connect.bind(null, testCase.input)).to.throw(testCase.expectedErrorMessage);
        });
    });
});

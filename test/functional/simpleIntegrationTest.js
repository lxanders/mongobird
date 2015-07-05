'use strict';

var mongobird = require('../../lib/mongobird'),
    expect = require('chai').expect;

describe('simple integration test', function () {
    var connection,
        db,
        anyCollection;

    beforeEach(function () {
        connection = mongobird.connect('mongodb://localhost:' + MONGOBIRD_TEST_PORT);
        db = connection.getDb('anyDb');
        anyCollection = db.getCollection('anyCollection');
    });

    it('should count correctly if no document exists', function () {
        return anyCollection.count({ anyField: 'anyValue' })
            .then(function (count) {
                expect(count).to.equal(0);
            });
    });

    it('should count correctly if documents exist', function () {
        return anyCollection.insert({ anyField: 'anyValue' })
            .then(function () {
                return anyCollection.count({ anyField: 'anyValue' });
            })
            .then(function (count) {
                expect(count).to.equal(1);
            });
    });
});

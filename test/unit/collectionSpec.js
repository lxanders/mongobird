'use strict';

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonAsPromised = require('sinon-as-promised'),
    collection = require('../../lib/collection');

chai.use(require('sinon-chai'));
sinonAsPromised(require('bluebird'));

describe('collection', function () {
    var db,
        connection,
        collectionName = 'anyCollection',
        getCollection;

    beforeEach(function () {
        connection = { collection: sinon.stub() };
        db = { ensureConnection: sinon.stub().resolves(connection) };
        getCollection = collection.getCollection.bind(null, db);
    });

    describe('getCollection', function () {
        it('should return a representation object', function () {
            expect(getCollection(collectionName)).to.be.an('object');
        });

        it('should have methods of the native collection object', function () {
            expect(getCollection(collectionName)).to.have.property('find')
                .that.is.a('function');
        });
    });

    describe('ensureCollection', function () {
        var nativeCollection = { find: sinon.stub().yields(null) },
            anyCollection;

        beforeEach(function () {
            connection.collection.yields(null, nativeCollection);
            anyCollection = getCollection(collectionName);
        });

        afterEach(function () {
            nativeCollection.find.reset();
        });

        it('should connect and fetch the native collection', function () {
            return anyCollection.find()
                .then(function () {
                    expect(db.ensureConnection).to.have.been.calledOnce;

                    expect(connection.collection).to.have.been.calledOnce
                        .and.to.have.been.calledWith(collectionName);

                    expect(connection.collection).to.have.been.calledAfter(db.ensureConnection);
                });
        });

        it('should call the native method with the correct arguments', function () {
            var query = { any: 'thing' },
                projection = { any: true };

            return anyCollection.find(query, projection)
                .then(function () {
                    expect(nativeCollection.find).to.have.been.calledOnce
                        .and.to.have.been.calledWith(query, projection);
                });
        });

        it('should only fetch the collection once', function () {
            return anyCollection.find()
                .then(anyCollection.find)
                .then(function () {
                    expect(connection.collection).not.to.have.been.calledTwice;
                });
        });
    });
});

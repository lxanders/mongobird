'use strict';

var mongobird = require('../../lib/mongobird'),
    expect = require('chai').expect;

describe('mongobird', function () {
    it('should export the connect method', function () {
        expect(mongobird).to.have.property('connect').that.is.a('function');
    });
});

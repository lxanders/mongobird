'use strict';

var expect = require('chai').expect,
    formatConnectString = require('../../lib/formatConnectString');

describe('formatConnectString', function () {

    var input;

    it('should add the mongodb:// identifier if it was not specified', function () {
        input = 'anyConnectString';

        expect(formatConnectString(input)).to.equal('mongodb://' + input);
    });

    it('should not change a connect string that already starts with the mongodb identifier', function () {
        input = 'mongodb://anyConnectString';

        expect(formatConnectString(input)).to.equal(input);
    });

});

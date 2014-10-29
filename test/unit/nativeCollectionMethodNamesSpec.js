'use strict';

var expect = require('chai').expect,
    nativeCollectionMethodNames = require('../../lib/nativeCollectionMethodNames');

describe('native collection method names', function () {
    it('should detect the available methods on native collection instances', function () {
        expect(nativeCollectionMethodNames)
            .to.contain('find')
            .and.to.contain('insert');
    });
});

'use strict';

var MongoBox = require('mongobox').MongoBox,
    mongobox = new MongoBox();

before(function (done) {
    mongobox.start(function (error) {
        if (error) {
            return done(error);
        }

        global.MONGOBIRD_TEST_PORT = mongobox.options.port;

        done();
    });
});

after(function (done) {
    mongobox.stop(done);
});

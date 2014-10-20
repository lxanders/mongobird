'use strict';

var stringUtils = require('beltjs').string;

function prependMongodbIdentifier(connectString) {
    var mongodbIdentifier = 'mongodb://';

    if (!stringUtils.startsWith(connectString, mongodbIdentifier)) {
        connectString = mongodbIdentifier + connectString;
    }

    return connectString;
}

module.exports = function formatConnectString(input) {
    var connectString = input;

    connectString = prependMongodbIdentifier(connectString);

    return connectString;
};

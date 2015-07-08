'use strict';

var connect = require('./connect'),
    database = require('./database');

module.exports = {
    connect: connect,
    close: database.close
};

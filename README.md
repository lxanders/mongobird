[![NPM Version](https://img.shields.io/npm/v/mongobird.svg?style=flat)](https://www.npmjs.org/package/mongobird)
[![Build Status](https://img.shields.io/travis/lxanders/mongobird/master.svg?style=flat)](https://travis-ci.org/lxanders/mongobird)
[![Coverage Status](https://img.shields.io/coveralls/lxanders/mongobird.svg?style=flat)](https://coveralls.io/r/lxanders/mongobird)
[![Dependencies](https://img.shields.io/david/lxanders/mongobird.svg?style=flat)](https://david-dm.org/lxanders/mongobird)
![Unicorn approved](https://img.shields.io/badge/unicorn-approved-ff69b4.svg?style=flat)

-----

[![Stories in Accepted](https://badge.waffle.io/lxanders/mongobird.png?label=accepted&title=Accepted)](https://waffle.io/lxanders/mongobird)
[![Stories in In%20Progress](https://badge.waffle.io/lxanders/mongobird.png?label=In%20Progress&title=In%20Progress)](https://waffle.io/lxanders/mongobird)
[![Stories in Please%20Review](https://badge.waffle.io/lxanders/mongobird.png?label=Please%20Review&title=Please%20Review)](https://waffle.io/lxanders/mongobird)

-----

# mongobird

Bluebird aware mongoDB driver.

## installation

Install the module via npm:

```
npm install mongobird
```

## usage

This simple example connects to a mongoDB instance, gets a specific database and collections and uses this collection
to add data and assert that it worked:

```js
var mongobird = require('mongobird'),
    connectionString,
    connection,
    anyDb,
    usersCollection;

// The connection string specifies which mongoDB instance should be used
connectionString = 'mongodb://localhost'

// Create a connection representation using a connection string
connection = mongobird.connect(connectionString)

// Get a representation for any database that is available through the mongoDB instance that was specified through the
// provided connection string
anyDb = connection.getDb('anyDb')

// Get a specific collection that is available through the database representation
usersCollection = anyDb.getCollection('users')

function logAddedUser(user) {
    console.log('Added user ' + user.username);
}

// Note that all the methods used before this were working lazily - they did not really connect to any database
usersCollection.insert({ username: 'anyUser' })
    .tap(logAddedUser)
    .then(usersCollection.count({ username: 'anyUser' })
    .then(function (count) {
        if (count !== 1) {
            throw new Error('User was not added correctly or exists more than once');
        }
    })
    .catch(function(error) {
        console.log('Handle errors or rethrow them if you are not able to');
    });
```

See the more detailed example above for a better understanding how everything works.

## core concept and technology stack

This project is in a very early state and many planned features are missing for now.

Nevertheless there is some interesting additional information:

- The core concepts were discussed and can be found in [this issue](https://github.com/lxanders/mongobird/issues/1)
- The technology stack was discussed and can be found in [this issue](https://github.com/lxanders/mongobird/issues/3)

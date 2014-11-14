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

// Get a representation for any database through the mongoDB instance from above
anyDb = connection.getDb('anyDb')

// Get any collection through this database representation
usersCollection = anyDb.getCollection('users')

function logAddedUser(user) {
    console.log('Added user ' + user.username);
}

function countUser(username) {
    return usersCollection.count({ username: username });
}

// Note that all the methods used before this were working lazily - they did not really connect to any database
usersCollection.insert({ username: 'anyUser' })
    .tap(logAddedUser)
    .then(countUser.bind(null, 'anyUser')
    .then(function (count) {
        if (count !== 1) {
            throw new Error('User was not added correctly or exists more than once');
        }
    })
    .catch(function(error) {
        console.log('Handle errors or rethrow them if you are not able to');
    });
```

*As mentioned above, it is important to understand, that the database and collection representations are notconnecting
to any specific database or collection before they are really used (e.g. for inserting data). One consequence of this is
that errors accessing these databases or collection (e.g. for not existing databases) will be thrown later when the
collection or database are really used.*

See the more detailed example above for a better understanding how everything works.

## explained example

This is a more complex example. See the notes below it to understand how it works internally.

```js
'use strict';

var mongobird = require('mongobird'),
    connectionString = 'mongodb://localhost',
    connection = mongobird.connect(connectionString),
    anyDb = connection.getDb('anyDb'),
    usersCollection = anyDb.getCollection('users'),
    defaultUser = { username: 'anyUser' },
    demoFinishedMessage = 'Demo finished succesfully. Have fun using mongobird';

function findDefaultUser() {
    return usersCollection.findOne({ username: defaultUser.username });
}

function assertDefaultUserDoesNotExist(user) {
    if (user) {
        throw new Error('Default user already exists');
    }
}

function removeUser(user) {
    console.log('Removing user:', user);

    return usersCollection.remove({ username: user.username  });
}

module.exports = function () {
    return usersCollection.remove({})
        .then(findDefaultUser)
        .then(assertDefaultUserDoesNotExist)
        .then(usersCollection.insert.bind(null, defaultUser))
        .tap(function (addedUsers) {
            if (addedUsers.length !== 1) {
                throw new Error('Not the right amount of users were added');
            } else if (addedUsers[0].username !== defaultUser.username) {
                throw new Error('Added user was not the default user');
            }

            console.log('Added default user:', defaultUser.username);
        })
        .then(findDefaultUser)
        .then(function (user) {
            if (!user) {
                throw new Error('Default user does not exist');
            }

            return user;
        })
        .then(removeUser)
        .then(function () {
            throw new Error('Something bad happened');
        })
        .then(console.log.bind(null, 'This is not executed if there is an uncaught error'))
        .catch(console.log.bind(null, 'Catching error'))
        .then(console.log.bind(null, 'Error was handled in last catch step'))
        .return(demoFinishedMessage)
        .finally(function () {
            // E.g. close the database connection
        });
};
```

1. Create a connection representation using the `connect` method providing a valid connection string (as specified in
    the [mongoDB documentation about connection strings](http://docs.mongodb.org/manual/reference/connection-string/)

    ```js
    connection = mongobird.connect(connectionString);
    ```

    The `connect` method is a synchronous function. The reason for this is that `mongobird` connects to mongodb
    instances lazily and caches the used database connections once they are established.

2. The returned `connection` object has the important method `getDb` which takes a database name and returns a database
    representation. The method works synchronous and does not connect to the database instantly but saves only the required
    data to connect to it later.

    ```js
    anyDb = connection.getDb('anyDb');
    ```

3. This returned database representation can be used to work on mongoDB collections. All
    [collection methods provided by the natice mongoDB driver]
    (http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html) are available and return `bluebird` Promises.
    Using one of these methods triggers a real connection to the specified mongo database.

    ```js
    usersCollection = anyDb.getCollection('users');
    ```

4. The most interesting part happens on this collection representation - some of the more common mongoDB methods are
    called and all is done using promises

    1. See the [general bluebird documentation](https://github.com/petkaantonov/bluebird) to learn more about promises 
    in general and how `bluebird` promises help you writing better readable, understandable and good-looking (in the
    opinionated view of the creators of this library) way

    2. Read the more specific [bluebird api documentation](https://github.com/petkaantonov/bluebird/blob/master/API.md)
    to get used more specifically to the `bluebird` methods. E.g. you can find documentation on the very useful methods
    `Promise.tap` and `Promise.try` that were used in the example above

    3. One further very good read recommendation is the [documentation about promise anti-patterns]
    (https://github.com/petkaantonov/bluebird/wiki/Promise-anti-patterns)

## api

* The `mongobird.connect` method provides a `connection representation`

```js
connection = mongobird.connect(connectionString);
```

* This `connection representation` can be used to get a `database representation`

```js
database = connection.getDb(databaseName);
```

* This `database representations` can be used to get  `collection representations`

```js
collection = database.getCollection(collectionName);
```

* These `collection representations` are a central part of `mongobird` (as they are in the native mongoDB driver). They
offer all [collection methods provided by the natice mongoDB driver]
(http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html) with one difference: The methods in the native
driver rely on callbacks to handle what is done once they are finished. As `mongobird` works with promises this looks
differently for them. Examples:

  * `insert`: Instead of calling collection.insert(document, callback)
    
    ```js`
    collection.insert(document)
        .then(function (result) { ... })
        .catch(function (error) { ... });
    ```
  
  
  * `find`:
    
    ```js
    collection.find(document)
        .then(function(foundDocuments) { ... } )
        .catch(function (error) { ... });
    ```
    
  * `remove`:
    
    ```js
    collection.remove(document)
        .then(function (result) { ... })
        .catch(function (error) { ... });
    ```

## core concept and technology stack

This project is in a very early state and many planned features are missing for now.

Nevertheless there is some interesting additional information:

- The core concepts were discussed and can be found in [this issue](https://github.com/lxanders/mongobird/issues/1)
- The technology stack was discussed and can be found in [this issue](https://github.com/lxanders/mongobird/issues/3)

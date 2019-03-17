# David Chang's Database

## Description

This is a simple database implementation.

## Getting Started

```
$ git clone https://github.com/davidianstyle/david-chang-db.git
$ cd david-chang-db
$ npm start
```

## Instructions

###### An in-memory database that has the following functions:

```SET [name] [value]```
Sets the name in the database to the given value

```GET [name]```
Prints the value for the given name. If the value is not in the database, prints NULL

```DELETE [name]```
Deletes the value from the database

```COUNT [value]```
Returns the number of names that have the given value assigned to them. If that value is not
assigned anywhere, prints 0

```END```
Exits the database

###### Database also supports transactions:

```BEGIN```
Begins a new transaction

```ROLLBACK```
Rolls back the most recent transaction. If there is no transaction to rollback, prints TRANSACTION NOT FOUND

```COMMIT```
Commits all of the open transactions

## Tests

```
$ git clone https://github.com/davidianstyle/david-chang-db.git
$ cd david-chang-db
$ npm run tests
```

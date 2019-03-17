const _ = require("lodash");

var api = {};

// Initialize DB
let DB = {};
let DBVERSIONS = [DB];

// Initialize environment variables
let VERBOSE = false;
let DEBUG = false;
let TESTING = false;

api.setValue = (name, value, extra) => {
    var usage = "Usage: SET [name] [value]";
    if (extra) {
	return "Too many parameters!";
    }
    else if (typeof(name) == 'undefined') {
	return "Must specify 'name'! " + usage;
    }
    else if (typeof(value) == 'undefined') {
	return "Must specify 'value'! " + usage;
    }

    // Get workingdb and update the value
    var workingdb = api.getWorkingDB();
    workingdb[name] = value;

    if (VERBOSE) {
	console.log("Setting '" + name + "' to '" + value + "'");
    }
    return true;
}

api.getValue = (name, extra) => {
    var usage = "Usage: GET [name]";
    if (extra) {
	return "Too many parameters! " + usage;
    }
    else if (typeof(name) == 'undefined') {
	return "Must specify 'name'! " + usage;
    }

    // Get value from working database
    var value;
    var workingdb = api.getWorkingDB();
    value = workingdb[name];

    if (!value) {
	value = 'NULL';
    }

    if (TESTING) {
	return value;
    }
    else {
	console.log(value);
	return true;
    }
}

api.deleteValue = (name, extra) => {
    var usage = "Usage: DELETE [name]";
    if (extra) {
	return "Too many parameters!";
    }
    else if (typeof(name) == 'undefined') {
	return "Must specify 'name' to delete! " + usage;
    }

    // Delete from working database
    var workingdb = api.getWorkingDB();
    if (!workingdb[name]) {
	return "Nothing stored in '" + name + "' to delete";
    }
    else {
	workingdb[name] = null;
	if (VERBOSE) {
	    console.log("Deleting value stored in '" + name + "'");
	}
	return true;
    }
}

api.countValue = (value, extra) => {
    if (extra) {
	return "Too many parameters!";
    }

    let lookup = {};
    var workingdb = api.getWorkingDB();
    lookup = _.invertBy(Object.assign({}, workingdb));

    if (DEBUG) {
	console.log(lookup);
    }

    if (typeof(lookup[value]) != 'object') {
	lookup[value] = [];
    }

    if (TESTING) {
	return lookup[value].length;
    }
    else {
	console.log(lookup[value].length);
	return true;
    }
}

api.getWorkingDB = () => {
    return _.last(DBVERSIONS);
}

api.getDB = () => {
    return _.first(DBVERSIONS);
}

api.getDBVERSIONS = () => {
    return DBVERSIONS;
}

api.beginTransaction = () => {
    // Set the working DB to match the existing DB
    var workingdb = Object.assign({}, api.getWorkingDB());
    if (DEBUG) {
	console.log("DBVERSIONS: ");
	console.log(DBVERSIONS);
    }

    // Push the working DB onto the DBVERSIONS array
    DBVERSIONS.push(workingdb);

    return true;
}

api.rollbackTransaction = () => {
    if (DBVERSIONS.length <= 1) {
	return "No transactions to rollback";
	console.log('TRANSACTION NOT FOUND');
    }
    else {
	// Remove most recent workingdb
	DBVERSIONS.pop();

	return true;
    }
}

api.commitTransaction = () => {
    if (DBVERSIONS.length <= 1) {
	return "No transactions to commit.";
    }
    else {
	api.setDB(Object.assign({}, api.getWorkingDB()));

	return true;
    }
}

api.dumpDB = () => {
    console.log(DB);
}

api.dumpDBVERSIONS = () => {
    console.log(DBVERSIONS);
}

api.resetDB = () => {
    api.setDB({});
    api.resetDBVERSIONS();
}

api.setDB = (db) => {
    DB = db;
    api.resetDBVERSIONS();
}

api.resetDBVERSIONS = () => {
    DBVERSIONS = [DB];
}

api.setVerbose = (value) => {
    VERBOSE = value;
}

api.setDebug = (value) => {
    DEBUG = value;
}

api.setTesting = (value) => {
    TESTING = value;
}

module.exports = api;

const _ = require("lodash");

var api = {};

// Initialize DB/TMPDB
let DB = {};
let TMPDB = {};

// Initialize environment variables
let INTRANSACTION = false;
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

    // Set value in working database (either DB or TMPDB)
    if (INTRANSACTION) {
	TMPDB[name] = value;
    }
    else {
	DB[name] = value;
    }
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

    // Get value from working database (either DB or TMPDB)
    var value;
    if (INTRANSACTION) {
	value = TMPDB[name];
    }
    else {
	value = DB[name];
    }

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

    // Delete from working database (either DB or TMPDB)
    if (INTRANSACTION) {
	if (!TMPDB[name]) {
	    return "Nothing stored in '" + name + "' to delete";
	}
	else {
	    TMPDB[name] = null;
	    if (VERBOSE) {
		console.log("Deleting value stored in '" + name + "'");
	    }
	    return true;
	}
    }
    else {
	if (!DB[name]) {
	    return "Nothing stored in '" + name + "'";
	}
	else {
	    DB[name] = null;
	    if (VERBOSE) {
		console.log("Deleting value stored in '" + name + "'");
	    }
	    return true;
	}
    }
}

api.countValue = (value, extra) => {
    if (extra) {
	return "Too many parameters!";
    }

    let lookup = {};
    if (INTRANSACTION) {
	lookup = _.invertBy(Object.assign({}, TMPDB));
    }
    else {
	lookup = _.invertBy(Object.assign({}, DB));
    }

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

api.beginTransaction = () => {
    if (INTRANSACTION) {
	return "Already in a transaction. Either COMMIT or ROLLBACK to begin another transaction.";
    }
    else {
	// Set environment variable to true
	INTRANSACTION = true;

	// Set the temporary DB to match the existing DB
	TMPDB = Object.assign({}, DB);
	if (DEBUG) {
	    console.log("Current DB state:");
	    console.log(DB);
	}

	return true;
    }
}

api.rollbackTransaction = () => {
    if (!INTRANSACTION) {
	return "Not currently in a transaction. Use BEGIN to start a transaction."
	console.log('TRANSACTION NOT FOUND');
    }
    else {
	// Reset the state of the temporary DB to match the existing DB
	TMPDB = Object.assign({}, DB);
	if (DEBUG) {
	    console.log("Resetting DB state:");
	    console.log(DB);
	}
	INTRANSACTION = false;

	return true;
    }
}

api.commitTransaction = () => {
    if (!INTRANSACTION) {
	return "Not currently in a transaction. Use BEGIN to start a transaction."
    }
    else {
	// Update the DB to the state of the temporary DB
	DB = Object.assign({}, TMPDB);
	if (DEBUG) {
	    console.log("Current DB state:");
	    console.log(DB);
	}
	INTRANSACTION = false;

	return true;
    }
}

api.dumpDB = () => {
    console.log(DB);
}

api.dumpTMPDB = () => {
    console.log(TMPDB);
}

api.getDB = () => {
    return DB;
}

api.getTMPDB = () => {
    return TMPDB;
}

api.resetDB = () => {
    DB = {};
}

api.resetTMPDB = () => {
    TMPDB = {};
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

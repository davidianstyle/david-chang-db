const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const dbapi = require("./api");

const init = () => {
    console.log(
	chalk.green(
	    figlet.textSync("David Chang DB", {
		font: "Standard",
		horizontalLayout: "default",
		verticalLayout: "default"
	    })
	)
    );
};

// Define a function for exiting
const exitDB = () => {
    console.log(
	chalk.white.bgGreen.bold(`Exiting David\'s Database!`)
    );
    exit;
};

// Set some environment variables
let DEBUG = false;

const run = () => {
    // Show script introduction
    init();

    // Set up recursive prompt
    inquirer.registerPrompt('recursive', require('inquirer-recursive'));
    inquirer.prompt([{
	type: 'recursive',
	message: 'Start database?',
	name: 'commands',
	prompts: [
	    {
		type: 'input',
		name: 'command',
		message: '>',
		validate: function (input) {
		    var [command, param1, param2, param3] = input.split(" ");

		    // Uncomment to turn on verbose output
		    // dbapi.setVerbose(true);
		    
		    // Uncomment to print debug output
		    // api.setDebug(true);

		    switch(command.toUpperCase()) {
		    case "SET":
			return dbapi.setValue(param1, param2, param3);
		    case "GET":
			return dbapi.getValue(param1, param2, param3);
		    case "DELETE":
			return dbapi.deleteValue(param1, param2, param3);
		    case "COUNT":
			return dbapi.countValue(param1, param2, param3)
		    case "END":
			exitDB();
		    case "BEGIN":
			return dbapi.beginTransaction();
		    case "ROLLBACK":
			return dbapi.rollbackTransaction();
		    case "COMMIT":
			return dbapi.commitTransaction();
		    case "DUMPDB":
			return dbapi.dumpDB();
		    case "DUMPTMPDB":
			return dbapi.dumpTMPDB();
		    default:
			return "Invalid command: '" + command + "'";
		    }
		}
	    }
	]
    }]).then(function(answers) {
	console.log(answers.commands);
    });
};

run();

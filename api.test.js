const dbapi = require("./api");
const _ = require("underscore");

let family = [
    ['david', 'chang'],
    ['diana', 'sim'],
    ['ben', 'chang'],
    ['hannah', 'chang'],
    ['phillip', 'chang'],
];

// Changes return behavior of getValues and countValues since they console.log by default
dbapi.setTesting(true);

// Start by setting database key => value pairs to family members' first name => last name
test('Set database values', () => {
    for (var member in family) {
	dbapi.setValue(_.first(family[member]), _.last(family[member]));
    }

    expect(dbapi.getDB()).toMatchObject({
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'chang',
	'phillip': 'chang',
    });
});

// Gut check that an entry was saved
test('Get database values', () => {
    expect(dbapi.getValue('david')).toBe('chang');
});

// Delete one entry and check that the database state reflects the new state correctly
test('Delete database values', () => {
    dbapi.deleteValue('david');
    expect(dbapi.getDB()).toMatchObject({
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'chang',
	'phillip': 'chang',
    });
});

// Clear out the database and make sure that it's empty
test('Reset database values', () => {
    dbapi.resetDB();
    expect(dbapi.getDB()).toMatchObject({});
});

// Re-insert family members again (first name => last name) and count number of 'chang's
test('Count database values', () => {
    for (var member in family) {
	dbapi.setValue(_.first(family[member]), _.last(family[member]));
    }

    expect(dbapi.countValue('chang')).toBe(4);
});

// Test transactions
test('Test transaction (begin)', () => {
    dbapi.beginTransaction();
    dbapi.setValue('diana', 'chang'); 			// Change diana's last name to chang
    expect(dbapi.getValue('diana')).toBe('chang'); 	// Make sure that the change occurred
    expect(dbapi.countValue('chang')).toBe(5); 		// Make sure the count reflects one more chang than before
    expect(dbapi.getDB()).toMatchObject({ 		// Check database save state to make sure there are no changes
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'chang',
	'phillip': 'chang',
    });
    expect(dbapi.getTMPDB()).toMatchObject({		// Check transaction state
	'david': 'chang',
	'diana': 'chang',
	'ben': 'chang',
	'hannah': 'chang',
	'phillip': 'chang',
    });
});

test('Test transaction (rollback)', () => {
    dbapi.rollbackTransaction();			// Rollback the transaction
    expect(dbapi.getValue('diana')).toBe('sim');	// Make sure that diana's last name was reverted to previous database state
    expect(dbapi.countValue('chang')).toBe(4);		// Make sure that chang count is back to 4
    expect(dbapi.getDB()).toMatchObject({		// Make sure that database save state remains unchanged
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'chang',
	'phillip': 'chang',
    });
    expect(dbapi.getTMPDB()).toMatchObject({		// Make sure that the transaction state matches the database save state again
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'chang',
	'phillip': 'chang',
    });
});

test('Test transaction (commit)', () => {
    dbapi.beginTransaction();				// Start new transaction
    dbapi.setValue('hannah', 'porter');			// Change hannah's last name to porter
    expect(dbapi.getValue('hannah')).toBe('porter');	// Make sure that the change occurred
    expect(dbapi.countValue('chang')).toBe(3);		// Make sure the count reflects one less chang than before
    expect(dbapi.getDB()).toMatchObject({		// Check database save state to make sure there are no changes
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'chang',
	'phillip': 'chang',
    });
    expect(dbapi.getTMPDB()).toMatchObject({		// Check transaction state
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'porter',
	'phillip': 'chang',
    });
    dbapi.commitTransaction();				// Commit the transaction
    expect(dbapi.getValue('hannah')).toBe('porter');	// Make sure that hannah is still a porter
    expect(dbapi.getDB()).toMatchObject({		// Make sure that the database save state now reflects hannah as a porter
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'porter',
	'phillip': 'chang',
    });
    expect(dbapi.getTMPDB()).toMatchObject({		// Make sure that the transaction state matches the database save state again
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'porter',
	'phillip': 'chang',
    });
});

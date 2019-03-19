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

////////////////////////////////////////////////////////////////////////////////
//
// Start by testing provided examples
//
////////////////////////////////////////////////////////////////////////////////

// Example #1
test('Example #1 - simple test', () => {
    dbapi.resetDB();
    expect(dbapi.getValue('a')).toBe('NULL');
    dbapi.setValue('a', 'foo');
    dbapi.setValue('b', 'foo');
    expect(dbapi.countValue('foo')).toBe(2);
    expect(dbapi.countValue('bar')).toBe(0);
    dbapi.deleteValue('a');
    expect(dbapi.countValue('foo')).toBe(1);
    dbapi.setValue('b', 'baz');
    expect(dbapi.countValue('foo')).toBe(0);
    expect(dbapi.getValue('b')).toBe('baz');
    expect(dbapi.getValue('B')).toBe('NULL');
});

// Example #2
test('Example #2 - count test', () => {
    dbapi.resetDB();
    dbapi.setValue('a', 'foo');
    dbapi.setValue('a', 'foo');
    expect(dbapi.countValue('foo')).toBe(1);
    expect(dbapi.getValue('a')).toBe('foo');
    dbapi.deleteValue('a');
    expect(dbapi.getValue('a')).toBe('NULL');
    expect(dbapi.countValue('foo')).toBe(0);
});

// Example #3
test('Example #3 - nested transaction rollback test', () => {
    dbapi.resetDB();
    dbapi.beginTransaction();
    dbapi.setValue('a', 'foo');
    expect(dbapi.getValue('a')).toBe('foo');
    dbapi.beginTransaction();
    dbapi.setValue('a', 'bar');
    expect(dbapi.getValue('a')).toBe('bar');
    dbapi.rollbackTransaction();
    expect(dbapi.getValue('a')).toBe('foo');
    dbapi.rollbackTransaction();
    expect(dbapi.getValue('a')).toBe('NULL');
});

// Example #4
test('Example #4 - nested transaction commit test', () => {
    dbapi.resetDB();
    dbapi.setValue('a', 'foo');
    dbapi.setValue('b', 'baz');
    dbapi.beginTransaction();
    expect(dbapi.getValue('a')).toBe('foo');
    dbapi.setValue('a', 'bar');
    expect(dbapi.countValue('bar')).toBe(1);
    dbapi.beginTransaction();
    expect(dbapi.countValue('bar')).toBe(1);
    dbapi.deleteValue('a');
    expect(dbapi.getValue('a')).toBe('NULL');
    expect(dbapi.countValue('bar')).toBe(0);
    dbapi.rollbackTransaction();
    expect(dbapi.getValue('a')).toBe('bar');
    expect(dbapi.countValue('bar')).toBe(1);
    dbapi.commitTransaction();
    expect(dbapi.getValue('a')).toBe('bar');
    expect(dbapi.getValue('b')).toBe('baz');
});

////////////////////////////////////////////////////////////////////////////////
//
// Validate with more testing
//
////////////////////////////////////////////////////////////////////////////////

// Test database transaction flattening utiity
test('Test utility to get current state of transactions', () => {
    dbapi.resetDB();
    for (var member in family) {
	dbapi.setValue(_.first(family[member]), _.last(family[member]));
    }
    dbapi.beginTransaction();
    dbapi.setValue('diana', 'chang');
    dbapi.beginTransaction();
    dbapi.setValue('hannah', 'porter');
    expect(dbapi.getFlattenedDB()).toMatchObject({
	'david': 'chang',
	'diana': 'chang',
	'ben': 'chang',
	'hannah': 'porter',
	'phillip': 'chang',
    });
});

// Set database key => value pairs to family members' first name => last name
test('Set database values', () => {
    dbapi.resetDB();
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
    dbapi.setValue('diana', 'chang'); 				// Change diana's last name to chang
    expect(dbapi.getValue('diana')).toBe('chang'); 		// Make sure that the change occurred
    expect(dbapi.countValue('chang')).toBe(5); 			// Make sure the count reflects one more chang than before
    expect(dbapi.getFlattenedDB()).toMatchObject({		// Check transaction state
	'david': 'chang',
	'diana': 'chang',
	'ben': 'chang',
	'hannah': 'chang',
	'phillip': 'chang',
    });
    expect(dbapi.getDB()).toMatchObject({ 			// Check database save state to make sure there are no changes
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'chang',
	'phillip': 'chang',
    });
});

test('Test transaction (rollback)', () => {
    dbapi.rollbackTransaction();				// Rollback the transaction
    expect(dbapi.getValue('diana')).toBe('sim');		// Make sure that diana's last name was reverted to previous database state
    expect(dbapi.countValue('chang')).toBe(4);			// Make sure that chang count is back to 4
    expect(dbapi.getFlattenedDB()).toMatchObject({		// Make sure that the transaction state matches the database save state again
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'chang',
	'phillip': 'chang',
    });
    expect(dbapi.getDB()).toMatchObject({			// Make sure that database save state remains unchanged
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'chang',
	'phillip': 'chang',
    });
});

test('Test transaction (commit)', () => {
    dbapi.beginTransaction();					// Start new transaction
    dbapi.setValue('hannah', 'porter');				// Change hannah's last name to porter
    expect(dbapi.getValue('hannah')).toBe('porter');		// Make sure that the change occurred
    expect(dbapi.countValue('chang')).toBe(3);			// Make sure the count reflects one less chang than before
    expect(dbapi.getFlattenedDB()).toMatchObject({		// Check transaction state
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'porter',
	'phillip': 'chang',
    });
    expect(dbapi.getDB()).toMatchObject({			// Check database save state to make sure there are no changes
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'chang',
	'phillip': 'chang',
    });
    dbapi.commitTransaction();					// Commit the transaction
    expect(dbapi.getValue('hannah')).toBe('porter');		// Make sure that hannah is still a porter
    expect(dbapi.getFlattenedDB()).toMatchObject({		// Make sure that the transaction state matches the database save state again
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'porter',
	'phillip': 'chang',
    });
    expect(dbapi.getDB()).toMatchObject({			// Make sure that the database save state now reflects hannah as a porter
	'david': 'chang',
	'diana': 'sim',
	'ben': 'chang',
	'hannah': 'porter',
	'phillip': 'chang',
    });
});

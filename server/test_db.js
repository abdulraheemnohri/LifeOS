const db = require('./db');

setTimeout(() => {
  db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      const tableNames = rows.map(row => row.name);
      const expectedTables = ['users', 'income', 'bills', 'loans', 'notes', 'experience'];

      console.log('Tables in database:', tableNames);

      const allPresent = expectedTables.every(table => tableNames.includes(table));
      if (allPresent) {
        console.log('All expected tables were created successfully.');
        process.exit(0);
      } else {
        console.error('Some tables are missing.');
        process.exit(1);
      }
    });
  });
}, 500);

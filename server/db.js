const sqlite3 = require('sqlite3').verbose();
const config = require('./config/config');

const db = new sqlite3.Database(config.DB_PATH);

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    full_name TEXT,
    email TEXT,
    bio TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Common tables with data structure:
  // id TEXT PRIMARY KEY, user_id INTEGER, created_at TEXT, updated_at TEXT, synced INTEGER
  const tables = ['income', 'bills', 'loans', 'notes', 'experience'];

  tables.forEach(table => {
    let columns = `
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      synced INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0
    `;

    if (table === 'income' || table === 'bills') {
      columns += `, name TEXT, amount REAL, date TEXT, category TEXT, note TEXT`;
    } else if (table === 'loans') {
      columns += `, person TEXT, amount REAL, type TEXT, date TEXT, status TEXT, note TEXT`;
    } else if (table === 'notes') {
      columns += `, title TEXT, content TEXT, color TEXT, pinned INTEGER DEFAULT 0`;
    } else if (table === 'experience') {
      columns += `, title TEXT, description TEXT, date TEXT`;
    }

    db.run(`CREATE TABLE IF NOT EXISTS ${table} (${columns})`, (err) => {
      if (!err) {
        db.run(`CREATE INDEX IF NOT EXISTS idx_${table}_user_id ON ${table} (user_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_${table}_updated_at ON ${table} (updated_at)`);
      }
    });
  });
});

module.exports = db;

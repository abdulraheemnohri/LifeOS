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

    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`, (err) => {
      if (!err) {
        db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('system_name', 'LifeOS Sync Enterprise')`);
        db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('maintenance_mode', 'false')`);
      }
    });

  // Common tables with data structure:
  // id TEXT PRIMARY KEY, user_id INTEGER, created_at TEXT, updated_at TEXT, synced INTEGER
  const tables = [
    'income', 'bills', 'loans', 'notes', 'experience', 'tasks',
    'wifi_clients', 'wifi_payments', 'billing_types', 'categories',
    'bill_categories', 'bill_category_fields', 'budgets',
    'groceries', 'utilities', 'habits', 'habit_logs', 'secrets'
  ];

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
      columns += `, name TEXT, amount REAL, date TEXT, category TEXT, category_id TEXT, dynamic_data TEXT, note TEXT, is_recurring INTEGER DEFAULT 0`;
    } else if (table === 'loans') {
      columns += `, person TEXT, amount REAL, type TEXT, date TEXT, status TEXT, note TEXT`;
    } else if (table === 'notes') {
      columns += `, title TEXT, content TEXT, color TEXT, pinned INTEGER DEFAULT 0, archived INTEGER DEFAULT 0`;
    } else if (table === 'experience') {
      columns += `, title TEXT, description TEXT, date TEXT, rating INTEGER, location TEXT, media_url TEXT, tags TEXT`;
    } else if (table === 'tasks') {
      columns += `, title TEXT, priority TEXT, due_date TEXT, completed INTEGER DEFAULT 0`;
    } else if (table === 'wifi_clients') {
      columns += `, type_id TEXT, name TEXT, mobile TEXT, imei TEXT, monthly_rate REAL, note TEXT`;
    } else if (table === 'wifi_payments') {
      columns += `, client_id TEXT, month TEXT, amount REAL, status TEXT, date_paid TEXT`;
    } else if (table === 'billing_types') {
      columns += `, name TEXT, type TEXT, default_amount REAL`;
    } else if (table === 'categories') {
      columns += `, name TEXT, type TEXT`;
    } else if (table === 'bill_categories') {
      columns += `, name TEXT`;
    } else if (table === 'bill_category_fields') {
      columns += `, category_id TEXT, field_name TEXT, field_type TEXT, field_order INTEGER`;
    } else if (table === 'budgets') {
      columns += `, category TEXT, amount REAL`;
    } else if (table === 'groceries') {
      columns += `, name TEXT, category TEXT, quantity TEXT, unit TEXT, price REAL, bought INTEGER DEFAULT 0, recurring INTEGER DEFAULT 0`;
    } else if (table === 'utilities') {
      columns += `, name TEXT, provider TEXT, account_no TEXT, meter_reading REAL, unit TEXT, last_bill_date TEXT, note TEXT`;
    } else if (table === 'habits') {
      columns += `, name TEXT, icon TEXT, color TEXT, target_days TEXT, goal_value REAL, unit TEXT, type TEXT`;
    } else if (table === 'habit_logs') {
      columns += `, habit_id TEXT, date TEXT, value REAL, status TEXT`;
    } else if (table === 'secrets') {
      columns += `, title TEXT, username TEXT, encrypted_content TEXT, category TEXT, icon TEXT`;
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

const fs = require('fs');
const path = require('path');

describe('Final System Check', () => {
  test('Server environment files exist', () => {
    expect(fs.existsSync(path.join(__dirname, 'app.js'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, 'db.js'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, 'package.json'))).toBe(true);
  });

  test('Client environment files exist', () => {
    expect(fs.existsSync(path.join(__dirname, '../client/index.html'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '../client/app.js'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '../client/storage.js'))).toBe(true);
  });

  test('Database tables initialized', (done) => {
    const db = require('./db');
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
      const tableNames = rows.map(r => r.name);
      ['users', 'income', 'bills', 'notes'].forEach(t => {
        expect(tableNames).toContain(t);
      });
      done();
    });
  });
});

const request = require('supertest');
const app = require('./app');
const db = require('./db');
const jwt = require('jsonwebtoken');
const config = require('./config/config');

describe('Dashboard API', () => {
  let userToken;
  let userId;

  beforeAll((done) => {
    db.serialize(() => {
      db.run('DELETE FROM users', () => {
        db.run('DELETE FROM income', () => {
          db.run('DELETE FROM bills', () => {
            const bcrypt = require('bcryptjs');
            const hash = bcrypt.hashSync('pass', 10);
            db.run(
              'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
              ['dashuser', hash, 'user'],
              function() {
                userId = this.lastID;
                userToken = jwt.sign({ id: userId, username: 'dashuser', role: 'user' }, config.JWT_SECRET);

                // Seed income and bills
                db.run('INSERT INTO income (id, user_id, amount) VALUES (?, ?, ?)', ['inc-1', userId, 5000], () => {
                  db.run('INSERT INTO bills (id, user_id, amount) VALUES (?, ?, ?)', ['bill-1', userId, 2000], done);
                });
              }
            );
          });
        });
      });
    });
  });

  test('GET /api/dashboard - should calculate summary stats', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.income).toBe(5000);
    expect(res.body.expense).toBe(2000);
    expect(res.body.balance).toBe(3000);
  });
});

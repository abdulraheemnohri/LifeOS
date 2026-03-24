const request = require('supertest');
const app = require('./app');
const db = require('./db');

describe('Auth and Admin APIs', () => {
  let adminToken;
  let userId;

  beforeAll((done) => {
    // Clean up and create an admin user
    db.serialize(() => {
      db.run('DELETE FROM users', () => {
        const bcrypt = require('bcryptjs');
        const hash = bcrypt.hashSync('adminpass', 10);
        db.run(
          'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
          ['admin', hash, 'admin'],
          done
        );
      });
    });
  });

  test('POST /api/auth/login - should login admin and return token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'adminpass' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    adminToken = res.body.token;
  });

  test('POST /api/admin/create-user - should create a new user', async () => {
    const res = await request(app)
      .post('/api/admin/create-user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'testuser', password: 'testpass', role: 'user' });

    expect(res.statusCode).toBe(201);
    expect(res.body.username).toBe('testuser');
    userId = res.body.id;
  });

  test('GET /api/admin/users - should list users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2); // admin + testuser
  });

  test('POST /api/admin/reset-password - should reset password', async () => {
    const res = await request(app)
      .post('/api/admin/reset-password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: userId, newPassword: 'newtestpass' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Password reset successful');
  });

  test('DELETE /api/admin/user/:id - should delete user', async () => {
    const res = await request(app)
      .delete(`/api/admin/user/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User deleted');
  });
});

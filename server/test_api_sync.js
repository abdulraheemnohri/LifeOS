const request = require('supertest');
const app = require('./app');
const db = require('./db');
const jwt = require('jsonwebtoken');
const config = require('./config/config');

describe('Sync API', () => {
  let userToken;
  let userId;

  beforeAll((done) => {
    db.serialize(() => {
      db.run('DELETE FROM users', () => {
        db.run('DELETE FROM notes', () => {
          const bcrypt = require('bcryptjs');
          const hash = bcrypt.hashSync('pass', 10);
          db.run(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            ['syncuser', hash, 'user'],
            function() {
              userId = this.lastID;
              userToken = jwt.sign({ id: userId, username: 'syncuser', role: 'user' }, config.JWT_SECRET);
              done();
            }
          );
        });
      });
    });
  });

  test('POST /api/sync/push - should push notes', async () => {
    const noteId = 'note-1';
    const now = new Date().toISOString();

    const res = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        data: {
          notes: [
            { id: noteId, title: 'Test Note', content: 'Sync this', updated_at: now }
          ]
        }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.results.notes.updated).toBe(1);
  });

  test('GET /api/sync/pull - should pull notes', async () => {
    const res = await request(app)
      .get('/api/sync/pull')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.notes.length).toBe(1);
    expect(res.body.data.notes[0].title).toBe('Test Note');
  });

  test('POST /api/sync/push - conflict resolution (older updated_at should not overwrite)', async () => {
    const noteId = 'note-1';
    const oldTime = '2020-01-01T00:00:00.000Z';

    const res = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        data: {
          notes: [
            { id: noteId, title: 'Old Note', content: 'Old content', updated_at: oldTime }
          ]
        }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.results.notes.updated).toBe(0);
  });
});

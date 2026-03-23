const request = require('supertest');
const app = require('./app');
const db = require('./db');
const jwt = require('jsonwebtoken');
const config = require('./config/config');

describe('Deletion Sync API', () => {
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
            ['deluser', hash, 'user'],
            function() {
              userId = this.lastID;
              userToken = jwt.sign({ id: userId, username: 'deluser', role: 'user' }, config.JWT_SECRET);
              done();
            }
          );
        });
      });
    });
  });

  test('Sync should handle deletions', async () => {
    const noteId = 'note-to-delete';
    const now = new Date().toISOString();

    // 1. Push a note
    await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        data: {
          notes: [{ id: noteId, title: 'Note to be deleted', content: 'content', updated_at: now, deleted: 0 }]
        }
      });

    // 2. Push same note with deleted=1
    const delTime = new Date().toISOString();
    const res = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        data: {
          notes: [{ id: noteId, title: 'Note to be deleted', content: 'content', updated_at: delTime, deleted: 1 }]
        }
      });

    expect(res.body.results.notes.updated).toBe(1);

    // 3. Pull and check
    const pullRes = await request(app)
      .get('/api/sync/pull')
      .set('Authorization', `Bearer ${userToken}`);

    const note = pullRes.body.data.notes.find(n => n.id === noteId);
    expect(note.deleted).toBe(1);
  });
});

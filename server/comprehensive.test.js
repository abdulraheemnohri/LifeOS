const request = require('supertest');
const app = require('./app');
const db = require('./db');
const bcrypt = require('bcryptjs');

let adminToken;
let userId;

beforeAll((done) => {
    // Setup admin user for testing
    bcrypt.hash('admin123', 10, (err, hash) => {
        db.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', ['admin_test', hash, 'admin'], function(err) {
            db.get('SELECT * FROM users WHERE username = ?', ['admin_test'], (err, row) => {
                userId = row.id;
                request(app)
                    .post('/api/auth/login')
                    .send({ username: 'admin_test', password: 'admin123' })
                    .end((err, res) => {
                        adminToken = res.body.token;
                        done();
                    });
            });
        });
    });
});

describe('LifeOS Sync Enterprise API Tests', () => {
    test('Database tables exist', (done) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
            const names = rows.map(r => r.name);
            expect(names).toContain('audit_logs');
            expect(names).toContain('tasks');
            expect(names).toContain('habits');
            expect(names).toContain('secrets');
            done();
        });
    });

    test('Audit Logs recorded on login', (done) => {
        db.all('SELECT * FROM audit_logs WHERE user_id = ? AND action = ?', [userId, 'LOGIN'], (err, rows) => {
            expect(rows.length).toBeGreaterThan(0);
            done();
        });
    });

    test('Sync Push & Audit Log', async () => {
        const payload = {
            data: {
                tasks: [{ id: 't-test', title: 'Test Task', priority: 'High', completed: 0, archived: 0 }]
            }
        };
        const res = await request(app)
            .post('/api/sync/push')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(payload);

        expect(res.status).toBe(200);
        expect(res.body.results.tasks.updated).toBe(1);

        // Verify audit log
        const logs = await new Promise(resolve => {
            db.all('SELECT * FROM audit_logs WHERE action = ?', ['SYNC_PUSH'], (err, rows) => resolve(rows));
        });
        expect(logs.length).toBeGreaterThan(0);
    });

    test('Admin Purge Records', async () => {
        // Mark a record as deleted and synced
        await new Promise(resolve => {
            db.run('UPDATE tasks SET deleted = 1, synced = 1 WHERE id = ?', ['t-test'], resolve);
        });

        const res = await request(app)
            .post('/api/admin/purge')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.purged).toBeGreaterThanOrEqual(1);
    });

    test('Admin Backup Download', async () => {
        const res = await request(app)
            .get('/api/admin/backup')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.header['content-type']).toBe('application/octet-stream');
    });

    test('Admin Audit Logs Fetch', async () => {
        const res = await request(app)
            .get('/api/admin/logs')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('username');
    });
});

afterAll((done) => {
    db.run('DELETE FROM users WHERE username = ?', ['admin_test'], () => {
        db.run('DELETE FROM audit_logs WHERE user_id = ?', [userId], done);
    });
});

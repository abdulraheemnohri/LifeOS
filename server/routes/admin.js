const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All admin routes require authentication and admin role
router.use(auth, admin);

// GET /api/admin/users
router.get('/users', (req, res) => {
  db.all('SELECT id, username, role, created_at FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json(rows);
  });
});

// POST /api/admin/create-user
router.post('/create-user', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    db.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hash, role || 'user'],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'User already exists' });
          }
          return res.status(500).json({ message: 'Server error' });
        }
        res.status(201).json({ id: this.lastID, username, role: role || 'user' });
      }
    );
  });
});

// DELETE /api/admin/user/:id
router.delete('/user/:id', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json({ message: 'User deleted' });
  });
});

// POST /api/admin/reset-password
router.post('/reset-password', (req, res) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  bcrypt.hash(newPassword, 10, (err, hash) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hash, userId],
      function(err) {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json({ message: 'Password reset successful' });
      }
    );
  });
});

// GET /api/admin/backup
router.get('/backup', (req, res) => {
  const dbFile = require('../config/config').DB_PATH;
  res.download(dbFile);
});

// GET /api/admin/logs
router.get('/logs', (req, res) => {
  // Simple mock logs
  const logs = [
    { timestamp: new Date().toISOString(), message: 'User admin logged in' },
    { timestamp: new Date().toISOString(), message: 'Sync push from user 1: 5 items' },
    { timestamp: new Date().toISOString(), message: 'New user created: test_user' }
  ];
  res.json(logs);
});

module.exports = router;

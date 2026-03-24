const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const config = require('../config/config');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        config.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          full_name: user.full_name,
          email: user.email,
          bio: user.bio
        }
      });
    });
  });
});

const auth = require('../middleware/auth');

// PUT /api/auth/profile
router.put('/profile', auth, (req, res) => {
  const { full_name, email, bio } = req.body;
  const userId = req.user.id;

  db.run(
    'UPDATE users SET full_name = ?, email = ?, bio = ? WHERE id = ?',
    [full_name, email, bio, userId],
    function(err) {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json({ success: true, message: 'Profile updated' });
    }
  );
});

// PUT /api/auth/change-password
router.put('/change-password', auth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  db.get('SELECT password FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
      if (!isMatch) return res.status(400).json({ message: 'Current password incorrect' });

      bcrypt.hash(newPassword, 10, (err, hash) => {
        db.run('UPDATE users SET password = ? WHERE id = ?', [hash, userId], (err) => {
          if (err) return res.status(500).json({ message: 'Server error' });
          res.json({ success: true, message: 'Password updated' });
        });
      });
    });
  });
});

module.exports = router;

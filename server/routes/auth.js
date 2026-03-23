const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const config = require('../config/config');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

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
        user: { id: user.id, username: user.username, role: user.role }
      });
    });
  });
});

module.exports = router;

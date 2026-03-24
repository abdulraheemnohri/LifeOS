const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

// GET /api/dashboard
router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    const incomePromise = new Promise((resolve, reject) => {
      db.all('SELECT amount FROM income WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows.reduce((sum, row) => sum + (row.amount || 0), 0));
      });
    });

    const expensePromise = new Promise((resolve, reject) => {
      db.all('SELECT amount FROM bills WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows.reduce((sum, row) => sum + (row.amount || 0), 0));
      });
    });

    const [income, expense] = await Promise.all([incomePromise, expensePromise]);
    const balance = income - expense;

    res.json({
      income,
      expense,
      balance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Dashboard stats failed' });
  }
});

module.exports = router;

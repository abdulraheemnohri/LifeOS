const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const syncService = require('../services/syncService');
const Audit = require('../services/auditService');

router.use(auth);

const TABLES = ['income', 'bills', 'loans', 'notes', 'experience', 'tasks', 'wifi_clients', 'wifi_payments', 'billing_types', 'categories', 'bill_categories', 'bill_category_fields', 'budgets', 'groceries', 'utilities', 'habits', 'habit_logs', 'secrets'];

// POST /api/sync/push
router.post('/push', async (req, res) => {
  const { data } = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  try {
    const results = {};
    let totalUpdated = 0;
    for (const table of TABLES) {
      if (data[table]) {
        results[table] = await syncService.push(req.user.id, table, data[table]);
        totalUpdated += results[table].updated || 0;
      }
    }

    if (totalUpdated > 0) {
        Audit.log(req.user.id, 'SYNC_PUSH', `User synced ${totalUpdated} records across multiple tables`, req.ip);
    }

    res.json({ message: 'Push successful', results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sync push failed' });
  }
});

// GET /api/sync/pull?lastSync=timestamp
router.get('/pull', async (req, res) => {
  const { lastSync } = req.query;

  try {
    const results = {};
    for (const table of TABLES) {
      results[table] = await syncService.pull(req.user.id, table, lastSync);
    }
    res.json({ lastSync: new Date().toISOString(), data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sync pull failed' });
  }
});

module.exports = router;

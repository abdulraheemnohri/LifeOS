const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const updateService = require('../services/updateService');

router.use(auth, admin);

// GET /api/update/check
router.get('/check', async (req, res) => {
  try {
    const update = await updateService.checkVersion();
    res.json(update);
  } catch (err) {
    res.status(500).json({ message: 'Failed to check for updates' });
  }
});

// POST /api/update/server
router.post('/server', (req, res) => {
  updateService.triggerServerUpdate(res);
});

module.exports = router;

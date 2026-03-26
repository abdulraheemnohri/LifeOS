const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const updateService = require('../services/updateService');

const Audit = require('../services/auditService');

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
  Audit.log(req.user.id, 'SERVER_UPDATE_TRIGGERED', 'Admin triggered a server-side git pull and update', req.ip);
  updateService.triggerServerUpdate(res);
});

module.exports = router;

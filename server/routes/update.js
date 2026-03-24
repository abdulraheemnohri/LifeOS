const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { exec } = require('child_process');

router.use(auth, admin);

// POST /api/update/server
router.post('/server', (req, res) => {
  // In a real scenario, we'd trigger a script or perform git pull
  // For this environment, we'll simulate the response
  console.log('Server update triggered by admin');

  exec('git pull && npm install', (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Update failed', error: err.message });
    }
    console.log(stdout);
    res.json({ message: 'Server update started. Restarting process...', stdout, stderr });

    // Simulate server restart (would typically be handled by pm2 or a supervisor)
    setTimeout(() => {
      console.log('Restarting server process...');
      process.exit(0);
    }, 1000);
  });
});

module.exports = router;

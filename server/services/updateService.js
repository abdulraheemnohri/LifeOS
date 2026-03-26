const { exec } = require('child_process');

const updateService = {
  checkVersion: async () => {
    // Simulated check of version.json (could be from GitHub)
    return {
      version: '1.0.1',
      message: 'New features added',
      type: 'optional',
      download_url: 'https://github.com/abdulraheemnohri/LifeOS/archive/refs/heads/main.zip'
    };
  },

  triggerServerUpdate: (res) => {
    console.log('Server update starting...');
    exec('git pull && npm install', (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Update failed', error: err.message });
      }

      console.log(stdout);
      res.json({
        message: 'Server update started successfully. Restarting process...',
        stdout,
        stderr,
        notice: 'Note: For the server to restart automatically, it should be managed by a process manager like PM2 (e.g., pm2 start app.js --watch).'
      });

      // Restart process
      setTimeout(() => {
        console.log('Update complete. Restarting server process to apply changes...');
        process.exit(0);
      }, 3000);
    });
  }
};

module.exports = updateService;

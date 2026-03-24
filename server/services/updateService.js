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
      res.json({ message: 'Server update started. Restarting process...', stdout, stderr });

      // Simulated process restart
      setTimeout(() => {
        console.log('Restarting server process...');
        process.exit(0);
      }, 1000);
    });
  }
};

module.exports = updateService;

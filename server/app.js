const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

const app = express();

app.use(cors());
app.use(express.json());

// Serve client files
app.use(express.static(path.join(__dirname, '../client')));

// Serve admin panel as static files
app.use('/admin-panel', express.static(path.join(__dirname, 'admin-panel')));

// Basic check endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'running', version: '1.0.0' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/sync', require('./routes/sync'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/update', require('./routes/update'));

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
  });
}

module.exports = app;

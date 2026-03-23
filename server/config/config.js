require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'lifeos-sync-enterprise-secret-key',
  DB_PATH: './database.sqlite'
};

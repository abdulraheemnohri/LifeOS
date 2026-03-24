const db = require('../db');

const syncService = {
  // Common push function for any table
  push: (userId, tableName, data) => {
    return new Promise((resolve, reject) => {
      if (!data || !Array.isArray(data)) return resolve({ updated: 0 });

      let updatedCount = 0;
      let processedCount = 0;

      if (data.length === 0) return resolve({ updated: 0 });

      data.forEach(item => {
        // Remove 'synced' field from incoming data as it's set by server
        const { synced, ...itemToStore } = item;

        // Check if item already exists
        db.get(`SELECT updated_at FROM ${tableName} WHERE id = ? AND user_id = ?`, [item.id, userId], (err, row) => {
          if (err) {
            console.error(err);
            processedCount++;
            if (processedCount === data.length) resolve({ updated: updatedCount });
            return;
          }

          if (row) {
            // Check if incoming is newer
            // Note: SQLite might store dates as strings, comparing directly may work or need Date objects
            if (new Date(item.updated_at) > new Date(row.updated_at)) {
              // Update existing
              const keys = Object.keys(itemToStore).filter(k => k !== 'id' && k !== 'user_id');
              const setClause = keys.map(k => `${k} = ?`).join(', ');
              const values = keys.map(k => itemToStore[k]);

              db.run(
                `UPDATE ${tableName} SET ${setClause}, synced = 1 WHERE id = ? AND user_id = ?`,
                [...values, item.id, userId],
                function(err) {
                  if (err) console.error(err);
                  else updatedCount++;
                  processedCount++;
                  if (processedCount === data.length) resolve({ updated: updatedCount });
                }
              );
            } else {
              processedCount++;
              if (processedCount === data.length) resolve({ updated: updatedCount });
            }
          } else {
            // Insert new
            const keys = Object.keys(itemToStore);
            const placeholders = keys.map(() => '?').join(', ');
            const values = keys.map(k => itemToStore[k]);

            db.run(
              `INSERT INTO ${tableName} (${keys.join(', ')}, user_id, synced) VALUES (${placeholders}, ?, 1)`,
              [...values, userId],
              function(err) {
                if (err) console.error(err);
                else updatedCount++;
                processedCount++;
                if (processedCount === data.length) resolve({ updated: updatedCount });
              }
            );
          }
        });
      });
    });
  },

  // Common pull function for any table
  pull: (userId, tableName, lastSync) => {
    return new Promise((resolve, reject) => {
      const query = lastSync
        ? `SELECT * FROM ${tableName} WHERE user_id = ? AND updated_at > ?`
        : `SELECT * FROM ${tableName} WHERE user_id = ?`;

      const params = lastSync ? [userId, lastSync] : [userId];

      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
};

module.exports = syncService;

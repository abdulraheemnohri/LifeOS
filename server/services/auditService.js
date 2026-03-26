const db = require('../db');

const Audit = {
    log: (userId, action, details, ip) => {
        db.run(
            'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
            [userId, action, details, ip],
            (err) => {
                if (err) console.error('Audit log error:', err);
            }
        );
    }
};

module.exports = Audit;

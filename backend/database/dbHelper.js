const db = require('./db');

// Helper to promisify database operations
const dbHelper = {
  // Run a query that returns all rows
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Run a query that returns a single row
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Run a query that modifies data (INSERT, UPDATE, DELETE)
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  // Execute a transaction
  transaction: (callback) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            reject(err);
            return;
          }

          Promise.resolve(callback())
            .then((result) => {
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            })
            .catch((error) => {
              db.run('ROLLBACK', () => {
                reject(error);
              });
            });
        });
      });
    });
  }
};

module.exports = dbHelper;

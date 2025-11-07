const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crowdfunding.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Adding missing tables...');

db.serialize(() => {
  // Create campaign_comments table
  db.run(`
    CREATE TABLE IF NOT EXISTS campaign_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating campaign_comments table:', err.message);
    } else {
      console.log('✅ Created campaign_comments table');
    }
  });

  // Create campaign_updates table
  db.run(`
    CREATE TABLE IF NOT EXISTS campaign_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating campaign_updates table:', err.message);
    } else {
      console.log('✅ Created campaign_updates table');
    }
  });

  // Create campaign_analytics table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS campaign_analytics (
      campaign_id INTEGER PRIMARY KEY,
      total_backers INTEGER DEFAULT 0,
      avg_pledge_amount DECIMAL(10, 2) DEFAULT 0,
      funding_percentage DECIMAL(5, 2) DEFAULT 0,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating campaign_analytics table:', err.message);
    } else {
      console.log('✅ Verified campaign_analytics table');
    }
  });

  // Create fund_release_log table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS fund_release_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      creator_id INTEGER NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      released_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) DEFAULT 'completed',
      transaction_hash VARCHAR(255),
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating fund_release_log table:', err.message);
    } else {
      console.log('✅ Verified fund_release_log table');
    }
  });

  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
  });
});

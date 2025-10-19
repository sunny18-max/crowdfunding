const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'crowdfunding.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Create users table with wallet support
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        wallet_balance REAL DEFAULT 1000.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create campaigns table
    db.run(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        goal_amount REAL NOT NULL,
        deadline DATETIME NOT NULL,
        creator_id INTEGER NOT NULL,
        total_pledged REAL DEFAULT 0,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'successful', 'failed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create pledges table
    db.run(`
      CREATE TABLE IF NOT EXISTS pledges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        campaign_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
      )
    `);

    // Create transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pledge_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'committed', 'rolled_back')),
        processed_at DATETIME,
        FOREIGN KEY (pledge_id) REFERENCES pledges(id) ON DELETE CASCADE
      )
    `);

    // Create wallet_transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        transaction_type TEXT NOT NULL CHECK(transaction_type IN ('debit', 'credit', 'refund', 'withdrawal')),
        amount REAL NOT NULL CHECK(amount > 0),
        balance_before REAL NOT NULL,
        balance_after REAL NOT NULL,
        reference_type TEXT CHECK(reference_type IN ('pledge', 'refund', 'campaign_payout', 'deposit')),
        reference_id INTEGER,
        description TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_campaigns_creator ON campaigns(creator_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_campaigns_deadline ON campaigns(deadline)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pledges_user ON pledges(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pledges_campaign ON pledges(campaign_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_pledge ON transactions(pledge_id)`);

    console.log('✅ Database initialized successfully');
  });
}

module.exports = db;

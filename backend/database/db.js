const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Initialize database
const isProduction = process.env.NODE_ENV === 'production';
let dbPath;

if (isProduction) {
  // Try to use /tmp directory if we can't write to /data
  try {
    if (!fs.existsSync('/data')) {
      fs.mkdirSync('/data', { recursive: true });
    }
    // Test write permission
    fs.writeFileSync('/data/test.txt', 'test');
    fs.unlinkSync('/data/test.txt');
    dbPath = '/data/crowdfunding.db';
  } catch (err) {
    console.warn('Could not write to /data, falling back to /tmp');
    dbPath = '/tmp/crowdfunding.db';
  }
} else {
  dbPath = path.join(__dirname, 'crowdfunding.db');
}

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

// Initialize database schema with enhanced features
function initializeDatabase() {
  db.serialize(() => {
    // Create user_roles table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_name TEXT UNIQUE NOT NULL CHECK(role_name IN ('admin', 'entrepreneur', 'investor')),
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default roles
    db.run(`INSERT OR IGNORE INTO user_roles (role_name, description) VALUES 
      ('admin', 'Platform administrator with full access'),
      ('entrepreneur', 'Campaign creator who can create and manage campaigns'),
      ('investor', 'Backer who can pledge to campaigns')
    `);

    // Create users table with role support
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'investor' CHECK(role IN ('admin', 'entrepreneur', 'investor')),
        wallet_balance REAL DEFAULT 1000.00 CHECK(wallet_balance >= 0),
        profile_image TEXT,
        bio TEXT,
        phone TEXT,
        location TEXT,
        is_verified BOOLEAN DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        last_login DATETIME,
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
        goal_amount REAL NOT NULL CHECK(goal_amount > 0),
        current_funds REAL DEFAULT 0 CHECK(current_funds >= 0),
        deadline DATETIME NOT NULL,
        creator_id INTEGER NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'successful', 'failed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create pledges table
    db.run(`
      CREATE TABLE IF NOT EXISTS pledges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        campaign_id INTEGER NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'committed', 'refunded')),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
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

    // Create permissions table
    db.run(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        resource TEXT NOT NULL,
        action TEXT NOT NULL CHECK(action IN ('create', 'read', 'update', 'delete', 'manage')),
        granted BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default permissions
    db.run(`INSERT OR IGNORE INTO permissions (role, resource, action) VALUES 
      ('admin', 'users', 'manage'),
      ('admin', 'campaigns', 'manage'),
      ('admin', 'pledges', 'manage'),
      ('admin', 'analytics', 'read'),
      ('entrepreneur', 'campaigns', 'create'),
      ('entrepreneur', 'campaigns', 'update'),
      ('entrepreneur', 'campaigns', 'read'),
      ('entrepreneur', 'analytics', 'read'),
      ('investor', 'campaigns', 'read'),
      ('investor', 'pledges', 'create'),
      ('investor', 'pledges', 'read')
    `);

    // Create user_activity_log table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL,
        activity_description TEXT,
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create notifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT CHECK(type IN ('info', 'success', 'warning', 'error')),
        is_read BOOLEAN DEFAULT 0,
        reference_type TEXT,
        reference_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create campaign_analytics table
    db.run(`
      CREATE TABLE IF NOT EXISTS campaign_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        total_backers INTEGER DEFAULT 0,
        total_pledged REAL DEFAULT 0,
        avg_pledge_amount REAL DEFAULT 0,
        funding_percentage REAL DEFAULT 0,
        days_remaining INTEGER,
        prediction_score REAL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
      )
    `);

    // Create audit_log table
    db.run(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        action_type TEXT NOT NULL CHECK(action_type IN ('INSERT', 'UPDATE', 'DELETE')),
        record_id INTEGER NOT NULL,
        old_value TEXT,
        new_value TEXT,
        changed_by INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT
      )
    `);

    // Create indexes for better performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_campaigns_creator ON campaigns(creator_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_campaigns_deadline ON campaigns(deadline)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pledges_user ON pledges(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pledges_campaign ON pledges(campaign_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pledges_status ON pledges(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_activity_log_user ON user_activity_log(user_id)`);

    // Create triggers
    db.run(`
      CREATE TRIGGER IF NOT EXISTS log_user_activity
      AFTER UPDATE ON users
      FOR EACH ROW
      WHEN NEW.last_login != OLD.last_login
      BEGIN
        INSERT INTO user_activity_log (user_id, activity_type, activity_description, timestamp)
        VALUES (NEW.id, 'login', 'User logged in', CURRENT_TIMESTAMP);
      END
    `);

    db.run(`
      CREATE TRIGGER IF NOT EXISTS notify_on_pledge
      AFTER INSERT ON pledges
      FOR EACH ROW
      BEGIN
        INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
        SELECT creator_id, 'New Pledge Received!', 
               'You received a pledge of $' || NEW.amount || ' on your campaign',
               'success', 'pledge', NEW.id
        FROM campaigns WHERE id = NEW.campaign_id;
      END
    `);

    db.run(`
      CREATE TRIGGER IF NOT EXISTS update_campaign_funds
      AFTER INSERT ON pledges
      FOR EACH ROW
      WHEN NEW.status = 'pending'
      BEGIN
        UPDATE campaigns 
        SET current_funds = current_funds + NEW.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.campaign_id;
      END
    `);

    console.log('✅ Enhanced database initialized successfully');
    console.log('📊 Features: Role-Based Auth, Notifications, Activity Logging, Triggers');
  });
}

module.exports = db;

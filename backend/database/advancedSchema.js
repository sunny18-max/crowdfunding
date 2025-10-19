const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize database with advanced features
const dbPath = path.join(__dirname, 'crowdfunding_advanced.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to Advanced SQLite database');
    initializeAdvancedDatabase();
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

function initializeAdvancedDatabase() {
  db.serialize(() => {
    // ============================================
    // 1. USERS TABLE WITH WALLET SYSTEM
    // ============================================
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        wallet_balance REAL DEFAULT 1000.00 CHECK(wallet_balance >= 0),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ============================================
    // 2. CAMPAIGNS TABLE WITH ENHANCED FIELDS
    // ============================================
    db.run(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        goal_amount REAL NOT NULL CHECK(goal_amount > 0),
        current_funds REAL DEFAULT 0 CHECK(current_funds >= 0),
        deadline DATETIME NOT NULL CHECK(deadline > CURRENT_TIMESTAMP),
        creator_id INTEGER NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'successful', 'failed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ============================================
    // 3. PLEDGES TABLE
    // ============================================
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

    // ============================================
    // 4. TRANSACTIONS TABLE (Wallet Transactions)
    // ============================================
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

    // ============================================
    // 5. FUND RELEASE LOG TABLE
    // ============================================
    db.run(`
      CREATE TABLE IF NOT EXISTS fund_release_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        creator_id INTEGER NOT NULL,
        amount_released REAL NOT NULL,
        release_status TEXT DEFAULT 'pending' CHECK(release_status IN ('pending', 'completed', 'failed')),
        released_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ============================================
    // 6. AUDIT LOG TABLE (Complete History)
    // ============================================
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

    // ============================================
    // 7. CAMPAIGN ANALYTICS TABLE
    // ============================================
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

    // ============================================
    // 8. INDEXES FOR PERFORMANCE
    // ============================================
    db.run(`CREATE INDEX IF NOT EXISTS idx_campaigns_deadline ON campaigns(deadline)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_campaigns_creator ON campaigns(creator_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_campaigns_goal ON campaigns(goal_amount)`);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_pledges_user ON pledges(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pledges_campaign ON pledges(campaign_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pledges_status ON pledges(status)`);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type)`);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp)`);

    // ============================================
    // 9. TRIGGERS FOR AUDIT LOGGING
    // ============================================
    
    // Trigger: Log user updates
    db.run(`
      CREATE TRIGGER IF NOT EXISTS audit_users_update
      AFTER UPDATE ON users
      FOR EACH ROW
      BEGIN
        INSERT INTO audit_log (table_name, action_type, record_id, old_value, new_value, timestamp)
        VALUES ('users', 'UPDATE', NEW.id, 
                json_object('balance', OLD.wallet_balance),
                json_object('balance', NEW.wallet_balance),
                CURRENT_TIMESTAMP);
      END;
    `);

    // Trigger: Log campaign status changes
    db.run(`
      CREATE TRIGGER IF NOT EXISTS audit_campaigns_update
      AFTER UPDATE ON campaigns
      FOR EACH ROW
      WHEN OLD.status != NEW.status
      BEGIN
        INSERT INTO audit_log (table_name, action_type, record_id, old_value, new_value, timestamp)
        VALUES ('campaigns', 'UPDATE', NEW.id,
                json_object('status', OLD.status, 'funds', OLD.current_funds),
                json_object('status', NEW.status, 'funds', NEW.current_funds),
                CURRENT_TIMESTAMP);
      END;
    `);

    // Trigger: Update campaign analytics on pledge
    db.run(`
      CREATE TRIGGER IF NOT EXISTS update_analytics_on_pledge
      AFTER INSERT ON pledges
      FOR EACH ROW
      BEGIN
        INSERT OR REPLACE INTO campaign_analytics (campaign_id, total_backers, total_pledged, avg_pledge_amount, funding_percentage, last_updated)
        SELECT 
          c.id,
          COUNT(DISTINCT p.user_id),
          SUM(p.amount),
          AVG(p.amount),
          (SUM(p.amount) / c.goal_amount) * 100,
          CURRENT_TIMESTAMP
        FROM campaigns c
        LEFT JOIN pledges p ON c.id = p.campaign_id
        WHERE c.id = NEW.campaign_id
        GROUP BY c.id;
      END;
    `);

    // Trigger: Auto-update campaign current_funds
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
      END;
    `);

    // Trigger: Automatic refund on campaign failure
    db.run(`
      CREATE TRIGGER IF NOT EXISTS auto_refund_on_failure
      AFTER UPDATE ON campaigns
      FOR EACH ROW
      WHEN NEW.status = 'failed' AND OLD.status = 'active'
      BEGIN
        -- Update all pending pledges to refunded
        UPDATE pledges
        SET status = 'refunded'
        WHERE campaign_id = NEW.id AND status = 'pending';
        
        -- Credit back to users' wallets (handled in application layer for complex logic)
      END;
    `);

    // ============================================
    // 10. VIEWS FOR ANALYTICS
    // ============================================
    
    // View: Top Campaigns by Funding
    db.run(`
      CREATE VIEW IF NOT EXISTS top_campaigns AS
      SELECT 
        c.id,
        c.title,
        c.goal_amount,
        c.current_funds,
        c.status,
        COUNT(DISTINCT p.id) as total_backers,
        (c.current_funds / c.goal_amount * 100) as funding_percentage,
        u.name as creator_name
      FROM campaigns c
      LEFT JOIN pledges p ON c.id = p.campaign_id
      LEFT JOIN users u ON c.creator_id = u.id
      GROUP BY c.id
      ORDER BY c.current_funds DESC;
    `);

    // View: User Statistics
    db.run(`
      CREATE VIEW IF NOT EXISTS user_statistics AS
      SELECT 
        u.id,
        u.name,
        u.email,
        u.wallet_balance,
        COUNT(DISTINCT c.id) as campaigns_created,
        COUNT(DISTINCT p.id) as pledges_made,
        COALESCE(SUM(p.amount), 0) as total_pledged,
        COALESCE(SUM(CASE WHEN c2.status = 'successful' THEN c2.current_funds ELSE 0 END), 0) as total_raised
      FROM users u
      LEFT JOIN campaigns c ON u.id = c.creator_id
      LEFT JOIN pledges p ON u.id = p.user_id
      LEFT JOIN campaigns c2 ON c2.creator_id = u.id
      GROUP BY u.id;
    `);

    // View: Campaign Performance Report
    db.run(`
      CREATE VIEW IF NOT EXISTS campaign_performance AS
      SELECT 
        c.id,
        c.title,
        c.status,
        c.goal_amount,
        c.current_funds,
        c.deadline,
        julianday(c.deadline) - julianday('now') as days_remaining,
        COUNT(DISTINCT p.id) as backer_count,
        AVG(p.amount) as avg_pledge,
        MIN(p.amount) as min_pledge,
        MAX(p.amount) as max_pledge,
        (c.current_funds / c.goal_amount * 100) as success_rate
      FROM campaigns c
      LEFT JOIN pledges p ON c.id = p.campaign_id
      GROUP BY c.id;
    `);

    // View: Transaction History Report
    db.run(`
      CREATE VIEW IF NOT EXISTS transaction_history AS
      SELECT 
        wt.id,
        wt.timestamp,
        u.name as user_name,
        wt.transaction_type,
        wt.amount,
        wt.balance_before,
        wt.balance_after,
        wt.reference_type,
        wt.description
      FROM wallet_transactions wt
      JOIN users u ON wt.user_id = u.id
      ORDER BY wt.timestamp DESC;
    `);

    console.log('✅ Advanced database schema initialized successfully');
    console.log('📊 Features added: Wallet System, Triggers, Audit Logs, Views, Indexes');
  });
}

module.exports = db;

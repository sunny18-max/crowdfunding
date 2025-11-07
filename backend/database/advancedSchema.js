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
    // 1. USER ROLES TABLE
    // ============================================
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

    // ============================================
    // 2. USERS TABLE WITH WALLET SYSTEM AND ROLES
    // ============================================
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role) REFERENCES user_roles(role_name)
      )
    `);

    // ============================================
    // 3. CAMPAIGNS TABLE WITH ENHANCED FIELDS
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
    // 4. PLEDGES TABLE
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
    // 5. TRANSACTIONS TABLE (Wallet Transactions)
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
    // 6. FUND RELEASE LOG TABLE
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
    // 7. PERMISSIONS TABLE
    // ============================================
    db.run(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        resource TEXT NOT NULL,
        action TEXT NOT NULL CHECK(action IN ('create', 'read', 'update', 'delete', 'manage')),
        granted BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role) REFERENCES user_roles(role_name)
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

    // ============================================
    // 8. USER ACTIVITY LOG TABLE
    // ============================================
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

    // ============================================
    // 9. CAMPAIGN CATEGORIES TABLE
    // ============================================
    db.run(`
      CREATE TABLE IF NOT EXISTS campaign_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default categories
    db.run(`INSERT OR IGNORE INTO campaign_categories (name, description, icon) VALUES 
      ('Technology', 'Tech innovations and gadgets', 'Cpu'),
      ('Art', 'Creative and artistic projects', 'Palette'),
      ('Music', 'Music albums and concerts', 'Music'),
      ('Film', 'Movies and video content', 'Film'),
      ('Games', 'Video games and board games', 'Gamepad2'),
      ('Fashion', 'Clothing and accessories', 'Shirt'),
      ('Food', 'Restaurants and food products', 'UtensilsCrossed'),
      ('Publishing', 'Books and magazines', 'BookOpen'),
      ('Education', 'Educational projects', 'GraduationCap'),
      ('Community', 'Community initiatives', 'Users')
    `);

    // ============================================
    // 10. CAMPAIGN UPDATES TABLE
    // ============================================
    db.run(`
      CREATE TABLE IF NOT EXISTS campaign_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
      )
    `);

    // ============================================
    // 11. CAMPAIGN COMMENTS TABLE
    // ============================================
    db.run(`
      CREATE TABLE IF NOT EXISTS campaign_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        comment TEXT NOT NULL,
        parent_comment_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_comment_id) REFERENCES campaign_comments(id) ON DELETE CASCADE
      )
    `);

    // ============================================
    // 12. NOTIFICATIONS TABLE
    // ============================================
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

    // ============================================
    // 13. AUDIT LOG TABLE (Complete History)
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
    // 14. CAMPAIGN ANALYTICS TABLE
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
    // 15. PERFORMANCE METRICS TABLE
    // ============================================
    db.run(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        metric_type TEXT,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ============================================
    // 16. INDEXES FOR PERFORMANCE
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
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_verified)`);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_activity_log_user ON user_activity_log(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON user_activity_log(timestamp)`);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)`);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_comments_campaign ON campaign_comments(campaign_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_comments_user ON campaign_comments(user_id)`);

    // ============================================
    // 17. TRIGGERS FOR AUDIT LOGGING
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

    // Trigger: Log user activity on login
    db.run(`
      CREATE TRIGGER IF NOT EXISTS log_user_activity
      AFTER UPDATE ON users
      FOR EACH ROW
      WHEN NEW.last_login != OLD.last_login
      BEGIN
        INSERT INTO user_activity_log (user_id, activity_type, activity_description, timestamp)
        VALUES (NEW.id, 'login', 'User logged in', CURRENT_TIMESTAMP);
      END;
    `);

    // Trigger: Create notification on new pledge
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
      END;
    `);

    // Trigger: Create notification on campaign success
    db.run(`
      CREATE TRIGGER IF NOT EXISTS notify_on_campaign_success
      AFTER UPDATE ON campaigns
      FOR EACH ROW
      WHEN NEW.status = 'successful' AND OLD.status = 'active'
      BEGIN
        INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
        VALUES (NEW.creator_id, 'Campaign Successful!', 
                'Congratulations! Your campaign "' || NEW.title || '" has been successfully funded!',
                'success', 'campaign', NEW.id);
      END;
    `);

    // ============================================
    // 18. VIEWS FOR ANALYTICS
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

    // View: Role-based User Statistics
    db.run(`
      CREATE VIEW IF NOT EXISTS role_based_statistics AS
      SELECT 
        role,
        COUNT(*) as user_count,
        AVG(wallet_balance) as avg_wallet_balance,
        SUM(wallet_balance) as total_wallet_balance,
        COUNT(CASE WHEN is_verified = 1 THEN 1 END) as verified_users
      FROM users
      GROUP BY role;
    `);

    // View: Entrepreneur Dashboard
    db.run(`
      CREATE VIEW IF NOT EXISTS entrepreneur_dashboard AS
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        COUNT(DISTINCT c.id) as total_campaigns,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_campaigns,
        COUNT(DISTINCT CASE WHEN c.status = 'successful' THEN c.id END) as successful_campaigns,
        COALESCE(SUM(c.current_funds), 0) as total_raised,
        COUNT(DISTINCT p.user_id) as total_backers
      FROM users u
      LEFT JOIN campaigns c ON u.id = c.creator_id
      LEFT JOIN pledges p ON c.id = p.campaign_id
      WHERE u.role = 'entrepreneur'
      GROUP BY u.id;
    `);

    // View: Investor Dashboard
    db.run(`
      CREATE VIEW IF NOT EXISTS investor_dashboard AS
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        u.wallet_balance,
        COUNT(DISTINCT p.id) as total_pledges,
        COUNT(DISTINCT p.campaign_id) as campaigns_backed,
        COALESCE(SUM(p.amount), 0) as total_invested,
        AVG(p.amount) as avg_pledge_amount
      FROM users u
      LEFT JOIN pledges p ON u.id = p.user_id
      WHERE u.role = 'investor'
      GROUP BY u.id;
    `);

    // View: Admin Dashboard
    db.run(`
      CREATE VIEW IF NOT EXISTS admin_dashboard AS
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'entrepreneur') as total_entrepreneurs,
        (SELECT COUNT(*) FROM users WHERE role = 'investor') as total_investors,
        (SELECT COUNT(*) FROM campaigns) as total_campaigns,
        (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as active_campaigns,
        (SELECT COUNT(*) FROM pledges) as total_pledges,
        (SELECT COALESCE(SUM(current_funds), 0) FROM campaigns) as total_funds_raised,
        (SELECT COALESCE(SUM(wallet_balance), 0) FROM users) as total_wallet_balance,
        (SELECT COUNT(*) FROM user_activity_log WHERE DATE(timestamp) = DATE('now')) as today_activities;
    `);

    // View: Campaign Performance with Category
    db.run(`
      CREATE VIEW IF NOT EXISTS campaign_performance_detailed AS
      SELECT 
        c.id,
        c.title,
        c.status,
        c.goal_amount,
        c.current_funds,
        c.deadline,
        julianday(c.deadline) - julianday('now') as days_remaining,
        u.name as creator_name,
        u.role as creator_role,
        COUNT(DISTINCT p.id) as backer_count,
        AVG(p.amount) as avg_pledge,
        (c.current_funds / c.goal_amount * 100) as funding_percentage,
        (SELECT COUNT(*) FROM campaign_comments WHERE campaign_id = c.id) as comment_count,
        (SELECT COUNT(*) FROM campaign_updates WHERE campaign_id = c.id) as update_count
      FROM campaigns c
      LEFT JOIN users u ON c.creator_id = u.id
      LEFT JOIN pledges p ON c.id = p.campaign_id
      GROUP BY c.id;
    `);

    console.log('✅ Advanced database schema initialized successfully');
    console.log('📊 Features added: Role-Based Auth, Wallet System, Triggers, Audit Logs, Views, Indexes');
    console.log('👥 Roles: Admin, Entrepreneur, Investor');
    console.log('🔐 Permissions system enabled');
    console.log('📈 Advanced analytics views created');
  });
}

module.exports = db;

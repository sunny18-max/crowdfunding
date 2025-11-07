const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database', 'crowdfunding_advanced.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Starting database migration to enhanced schema...\n');

async function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

async function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function migrate() {
  try {
    console.log('📊 Step 1: Checking existing schema...');
    
    // Check if role column exists
    const tableInfo = await allQuery("PRAGMA table_info(users)");
    const hasRole = tableInfo.some(col => col.name === 'role');
    
    if (!hasRole) {
      console.log('✅ Adding role column to users table...');
      
      // Create new users table with role
      await runQuery(`
        CREATE TABLE users_new (
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
      
      // Copy data from old table
      await runQuery(`
        INSERT INTO users_new (id, name, email, password, wallet_balance, created_at, updated_at)
        SELECT id, name, email, password, wallet_balance, created_at, updated_at
        FROM users
      `);
      
      // Drop old table and rename new one
      await runQuery('DROP TABLE users');
      await runQuery('ALTER TABLE users_new RENAME TO users');
      
      console.log('✅ Users table updated successfully');
    } else {
      console.log('✅ Role column already exists');
    }
    
    console.log('\n📊 Step 2: Creating new tables...');
    
    // Create user_roles table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_name TEXT UNIQUE NOT NULL CHECK(role_name IN ('admin', 'entrepreneur', 'investor')),
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await runQuery(`
      INSERT OR IGNORE INTO user_roles (role_name, description) VALUES 
        ('admin', 'Platform administrator with full access'),
        ('entrepreneur', 'Campaign creator who can create and manage campaigns'),
        ('investor', 'Backer who can pledge to campaigns')
    `);
    console.log('✅ User roles table created');
    
    // Create permissions table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        resource TEXT NOT NULL,
        action TEXT NOT NULL CHECK(action IN ('create', 'read', 'update', 'delete', 'manage')),
        granted BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await runQuery(`
      INSERT OR IGNORE INTO permissions (role, resource, action) VALUES 
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
    console.log('✅ Permissions table created');
    
    // Create user_activity_log table
    await runQuery(`
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
    console.log('✅ User activity log table created');
    
    // Create campaign_categories table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS campaign_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await runQuery(`
      INSERT OR IGNORE INTO campaign_categories (name, description, icon) VALUES 
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
    console.log('✅ Campaign categories table created');
    
    // Create campaign_updates table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS campaign_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Campaign updates table created');
    
    // Create campaign_comments table
    await runQuery(`
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
    console.log('✅ Campaign comments table created');
    
    // Create notifications table
    await runQuery(`
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
    console.log('✅ Notifications table created');
    
    // Create performance_metrics table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        metric_type TEXT,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Performance metrics table created');
    
    console.log('\n📊 Step 3: Creating indexes...');
    
    await runQuery('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_verified)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_activity_log_user ON user_activity_log(user_id)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON user_activity_log(timestamp)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_comments_campaign ON campaign_comments(campaign_id)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_comments_user ON campaign_comments(user_id)');
    
    console.log('✅ Indexes created');
    
    console.log('\n📊 Step 4: Creating views...');
    
    // Role-based statistics view
    await runQuery(`
      CREATE VIEW IF NOT EXISTS role_based_statistics AS
      SELECT 
        role,
        COUNT(*) as user_count,
        AVG(wallet_balance) as avg_wallet_balance,
        SUM(wallet_balance) as total_wallet_balance,
        COUNT(CASE WHEN is_verified = 1 THEN 1 END) as verified_users
      FROM users
      GROUP BY role
    `);
    
    // Entrepreneur dashboard view
    await runQuery(`
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
      GROUP BY u.id
    `);
    
    // Investor dashboard view
    await runQuery(`
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
      GROUP BY u.id
    `);
    
    // Admin dashboard view
    await runQuery(`
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
        (SELECT COUNT(*) FROM user_activity_log WHERE DATE(timestamp) = DATE('now')) as today_activities
    `);
    
    console.log('✅ Views created');
    
    console.log('\n📊 Step 5: Creating triggers...');
    
    // Log user activity on login
    await runQuery(`
      CREATE TRIGGER IF NOT EXISTS log_user_activity
      AFTER UPDATE ON users
      FOR EACH ROW
      WHEN NEW.last_login != OLD.last_login
      BEGIN
        INSERT INTO user_activity_log (user_id, activity_type, activity_description, timestamp)
        VALUES (NEW.id, 'login', 'User logged in', CURRENT_TIMESTAMP);
      END
    `);
    
    // Create notification on new pledge
    await runQuery(`
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
    
    // Create notification on campaign success
    await runQuery(`
      CREATE TRIGGER IF NOT EXISTS notify_on_campaign_success
      AFTER UPDATE ON campaigns
      FOR EACH ROW
      WHEN NEW.status = 'successful' AND OLD.status = 'active'
      BEGIN
        INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
        VALUES (NEW.creator_id, 'Campaign Successful!', 
                'Congratulations! Your campaign "' || NEW.title || '" has been successfully funded!',
                'success', 'campaign', NEW.id);
      END
    `);
    
    console.log('✅ Triggers created');
    
    console.log('\n📊 Step 6: Creating default admin user...');
    
    const adminExists = await getQuery("SELECT * FROM users WHERE email = 'admin@fundstarter.com'");
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await runQuery(
        `INSERT INTO users (name, email, password, role, wallet_balance, is_verified) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Admin User', 'admin@fundstarter.com', hashedPassword, 'admin', 10000, 1]
      );
      console.log('✅ Default admin user created');
      console.log('   Email: admin@fundstarter.com');
      console.log('   Password: admin123');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Database Statistics:');
    
    const userCount = await getQuery('SELECT COUNT(*) as count FROM users');
    const campaignCount = await getQuery('SELECT COUNT(*) as count FROM campaigns');
    const pledgeCount = await getQuery('SELECT COUNT(*) as count FROM pledges');
    
    console.log(`   Users: ${userCount.count}`);
    console.log(`   Campaigns: ${campaignCount.count}`);
    console.log(`   Pledges: ${pledgeCount.count}`);
    
    console.log('\n🎉 Your database is now enhanced with advanced features!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

migrate().catch(console.error);

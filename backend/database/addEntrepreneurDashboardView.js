const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crowdfunding.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking database tables...');

// First, check if the database has the required tables
db.serialize(async () => {
  try {
    // Check if required tables exist
    const checkTable = (table) => {
      return new Promise((resolve) => {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [table], (err, row) => {
          if (err) {
            console.error(`❌ Error checking for table ${table}:`, err);
            resolve(false);
          } else {
            const exists = !!row;
            console.log(`   ${exists ? '✅' : '❌'} Table ${table}: ${exists ? 'Exists' : 'Missing'}`);
            resolve(exists);
          }
        });
      });
    };

    const requiredTables = ['users', 'campaigns', 'pledges'];
    const tableChecks = await Promise.all(requiredTables.map(checkTable));
    
    if (tableChecks.some(exists => !exists)) {
      console.error('❌ Missing required tables. Please ensure all tables exist before creating the view.');
      db.close();
      return;
    }

    console.log('\n🔄 Creating entrepreneur_dashboard view...');

    // Drop the view if it exists
    await new Promise((resolve) => {
      db.run('DROP VIEW IF EXISTS entrepreneur_dashboard', (err) => {
        if (err) {
          console.error('❌ Error dropping existing view:', err);
          resolve(false);
        } else {
          console.log('✅ Dropped existing view (if any)');
          resolve(true);
        }
      });
    });

    // Create the view
    await new Promise((resolve) => {
      const createViewSQL = `
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
      `;

      db.run(createViewSQL, (err) => {
        if (err) {
          console.error('❌ Error creating view:', err);
          resolve(false);
        } else {
          console.log('✅ Created entrepreneur_dashboard view');
          resolve(true);
        }
      });
    });

    // Verify the view was created
    db.get("SELECT sql FROM sqlite_master WHERE type='view' AND name='entrepreneur_dashboard'", (err, row) => {
      if (err) {
        console.error('❌ Error verifying view:', err);
      } else if (row) {
        console.log('\n✅ Success! entrepreneur_dashboard view created successfully');
        console.log('\nView definition:');
        console.log('----------------');
        console.log(row.sql);
        console.log('\nYou can now use the entrepreneur dashboard.');
      } else {
        console.error('❌ Error: Failed to create entrepreneur_dashboard view');
        console.log('\nTroubleshooting steps:');
        console.log('1. Check that all required tables (users, campaigns, pledges) exist');
        console.log('2. Verify that the users table has a role column');
        console.log('3. Check that campaigns table has status and current_funds columns');
      }
      
      db.close();
    });
  } catch (error) {
    console.error('❌ An error occurred:', error);
    db.close();
  }
});
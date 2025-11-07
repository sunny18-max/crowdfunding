const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crowdfunding.db');
const db = new sqlite3.Database(dbPath);

async function clearMockData() {
  console.log('🧹 Starting to clear mock data...');

  try {
    // Enable foreign keys
    await runQuery('PRAGMA foreign_keys = ON');

    // Clear data in reverse order of dependencies
    console.log('🗑️  Clearing existing data...');
    
    await runQuery('DELETE FROM pledges');
    console.log('✅ Cleared pledges');
    
    await runQuery('DELETE FROM wallet_transactions');
    console.log('✅ Cleared wallet transactions');
    
    await runQuery('DELETE FROM notifications');
    console.log('✅ Cleared notifications');
    
    await runQuery('DELETE FROM user_activity_log');
    console.log('✅ Cleared activity logs');
    
    await runQuery('DELETE FROM campaigns');
    console.log('✅ Cleared campaigns');
    
    // Keep only the admin user (if it exists)
    await runQuery("DELETE FROM users WHERE email != 'vardhan@gmail.com' AND email != 'admin@fundstarter.com'");
    console.log('✅ Cleared non-admin users');
    
    // Reset auto-increment counters
    await runQuery('DELETE FROM sqlite_sequence');
    console.log('✅ Reset auto-increment counters');

    console.log('\n✅ All mock data has been cleared successfully!');
    console.log('The database now contains only essential admin users.');
    
  } catch (error) {
    console.error('❌ Error clearing mock data:', error);
  } finally {
    db.close(() => {
      console.log('Database connection closed');
      process.exit(0);
    });
  }
}

// Helper function to run queries
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Run the cleanup
clearMockData();

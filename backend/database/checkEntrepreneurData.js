const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crowdfunding.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking entrepreneur dashboard data...');

// Check data in entrepreneur_dashboard view
db.all('SELECT * FROM entrepreneur_dashboard', (err, rows) => {
  if (err) {
    console.error('❌ Error querying entrepreneur_dashboard:', err);
    return;
  }
  
  console.log('\n📊 entrepreneur_dashboard view data:');
  console.table(rows);
  
  // Check if any user has campaigns
  db.get("SELECT COUNT(*) as count FROM campaigns WHERE creator_id IN (SELECT id FROM users WHERE role = 'entrepreneur')", (err, row) => {
    if (err) {
      console.error('❌ Error checking campaigns:', err);
      return;
    }
    console.log(`\n📈 Total campaigns by entrepreneurs: ${row.count}`);
    
    // Check users with entrepreneur role
    db.all("SELECT id, name, email FROM users WHERE role = 'entrepreneur'", (err, entrepreneurs) => {
      if (err) {
        console.error('❌ Error fetching entrepreneurs:', err);
        return;
      }
      
      console.log('\n👥 Entrepreneurs in the system:');
      console.table(entrepreneurs);
      
      // For each entrepreneur, check their campaigns
      entrepreneurs.forEach(entrepreneur => {
        db.get(
          `SELECT 
             COUNT(*) as campaign_count,
             SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_campaigns,
             SUM(CASE WHEN status = 'successful' THEN 1 ELSE 0 END) as successful_campaigns,
             SUM(current_funds) as total_raised
           FROM campaigns 
           WHERE creator_id = ?`, 
          [entrepreneur.id],
          (err, stats) => {
            if (err) {
              console.error(`❌ Error getting stats for entrepreneur ${entrepreneur.id}:`, err);
              return;
            }
            
            console.log(`\n📊 Stats for ${entrepreneur.name} (${entrepreneur.email}):`);
            console.log(`   Total campaigns: ${stats.campaign_count || 0}`);
            console.log(`   Active campaigns: ${stats.active_campaigns || 0}`);
            console.log(`   Successful campaigns: ${stats.successful_campaigns || 0}`);
            console.log(`   Total raised: $${(stats.total_raised || 0).toLocaleString()}`);
            
            // Check if this is the last entrepreneur to close the DB
            if (entrepreneurs.indexOf(entrepreneur) === entrepreneurs.length - 1) {
              db.close();
            }
          }
        );
      });
      
      // If no entrepreneurs, close the DB
      if (entrepreneurs.length === 0) {
        db.close();
      }
    });
  });
});

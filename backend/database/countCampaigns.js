const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crowdfunding.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Counting campaigns in the database...');

db.serialize(() => {
  // Count total campaigns
  db.get('SELECT COUNT(*) as count FROM campaigns', (err, row) => {
    if (err) {
      console.error('❌ Error counting campaigns:', err);
    } else {
      console.log(`✅ Total campaigns in database: ${row.count}`);
      
      // Count campaigns by status
      db.all(
        'SELECT status, COUNT(*) as count FROM campaigns GROUP BY status',
        (err, rows) => {
          if (err) {
            console.error('❌ Error getting campaign statuses:', err);
          } else {
            console.log('\n📊 Campaigns by status:');
            rows.forEach(row => {
              console.log(`   ${row.status}: ${row.count} campaigns`);
            });
          }
          
          // Count campaigns by creator
          db.all(
            `SELECT u.name as creator, COUNT(c.id) as campaign_count 
             FROM campaigns c
             JOIN users u ON c.creator_id = u.id 
             GROUP BY c.creator_id
             ORDER BY campaign_count DESC`,
            (err, creators) => {
              if (err) {
                console.error('❌ Error getting campaign creators:', err);
              } else {
                console.log('\n👥 Campaigns by creator:');
                creators.forEach(creator => {
                  console.log(`   ${creator.creator}: ${creator.campaign_count} campaigns`);
                });
              }
              
              // Check for any potential issues
              db.get(
                'SELECT COUNT(DISTINCT id) as unique_ids, COUNT(*) as total_rows FROM campaigns',
                (err, result) => {
                  if (err) {
                    console.error('❌ Error checking for duplicate IDs:', err);
                  } else if (result.unique_ids !== result.total_rows) {
                    console.log('\n⚠️  Warning: Duplicate campaign IDs detected!');
                  } else {
                    console.log('\n✅ All campaign IDs are unique');
                  }
                  
                  db.close();
                }
              );
            }
          );
        }
      );
    }
  });
});

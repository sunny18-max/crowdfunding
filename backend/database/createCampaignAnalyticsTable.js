const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crowdfunding.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking for campaign_analytics table...');

// SQL to create the campaign_analytics table if it doesn't exist
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS campaign_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL UNIQUE,
    total_backers INTEGER DEFAULT 0,
    avg_pledge_amount DECIMAL(12, 2) DEFAULT 0,
    funding_percentage DECIMAL(5, 2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
  );
`;

// SQL to populate initial data for existing campaigns
const populateAnalyticsSQL = `
  INSERT OR IGNORE INTO campaign_analytics (campaign_id, total_backers, avg_pledge_amount, funding_percentage)
  SELECT 
    c.id as campaign_id,
    COUNT(DISTINCT p.id) as total_backers,
    COALESCE(AVG(p.amount), 0) as avg_pledge_amount,
    CASE 
      WHEN c.goal_amount > 0 THEN (COALESCE(SUM(p.amount), 0) * 100.0) / c.goal_amount 
      ELSE 0 
    END as funding_percentage
  FROM campaigns c
  LEFT JOIN pledges p ON c.id = p.campaign_id
  GROUP BY c.id;
`;

db.serialize(() => {
  // Create the table
  db.run(createTableSQL, function(err) {
    if (err) {
      console.error('❌ Error creating campaign_analytics table:', err);
      db.close();
      return;
    }
    console.log('✅ Created campaign_analytics table');

    // Populate initial data
    db.run(populateAnalyticsSQL, function(err) {
      if (err) {
        console.error('❌ Error populating campaign_analytics:', err);
      } else {
        console.log(`✅ Populated campaign_analytics with data for ${this.changes} campaigns`);
      }
      
      // Verify the table was created
      db.get("SELECT COUNT(*) as count FROM campaign_analytics", (err, row) => {
        if (err) {
          console.error('❌ Error verifying campaign_analytics table:', err);
        } else {
          console.log(`ℹ️  campaign_analytics table contains ${row.count} records`);
        }
        db.close();
      });
    });
  });
});

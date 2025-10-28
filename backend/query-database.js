const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'crowdfunding.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Database Contents\n');
console.log('='.repeat(60));

// View all users
console.log('\n👥 USERS:');
db.all('SELECT id, name, email, wallet_balance, created_at FROM users', (err, users) => {
  if (err) {
    console.error('Error:', err);
  } else if (users.length === 0) {
    console.log('   No users found');
  } else {
    users.forEach(user => {
      console.log(`\n   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Wallet: $${user.wallet_balance}`);
      console.log(`   Created: ${user.created_at}`);
    });
  }

  // View all campaigns
  console.log('\n' + '='.repeat(60));
  console.log('\n🎯 CAMPAIGNS:');
  db.all('SELECT id, title, goal_amount, total_pledged, status, deadline FROM campaigns', (err, campaigns) => {
    if (err) {
      console.error('Error:', err);
    } else if (campaigns.length === 0) {
      console.log('   No campaigns found');
    } else {
      campaigns.forEach(campaign => {
        console.log(`\n   ID: ${campaign.id}`);
        console.log(`   Title: ${campaign.title}`);
        console.log(`   Goal: $${campaign.goal_amount}`);
        console.log(`   Raised: $${campaign.total_pledged}`);
        console.log(`   Status: ${campaign.status}`);
        console.log(`   Deadline: ${campaign.deadline}`);
      });
    }

    // View all pledges
    console.log('\n' + '='.repeat(60));
    console.log('\n💰 PLEDGES:');
    db.all('SELECT id, user_id, campaign_id, amount, timestamp FROM pledges', (err, pledges) => {
      if (err) {
        console.error('Error:', err);
      } else if (pledges.length === 0) {
        console.log('   No pledges found');
      } else {
        pledges.forEach(pledge => {
          console.log(`\n   ID: ${pledge.id}`);
          console.log(`   User ID: ${pledge.user_id}`);
          console.log(`   Campaign ID: ${pledge.campaign_id}`);
          console.log(`   Amount: $${pledge.amount}`);
          console.log(`   Time: ${pledge.timestamp}`);
        });
      }

      // Database stats
      console.log('\n' + '='.repeat(60));
      console.log('\n📈 STATISTICS:');
      db.get(`
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM campaigns) as total_campaigns,
          (SELECT COUNT(*) FROM pledges) as total_pledges,
          (SELECT COALESCE(SUM(wallet_balance), 0) FROM users) as total_wallet_balance,
          (SELECT COALESCE(SUM(total_pledged), 0) FROM campaigns) as total_raised
      `, (err, stats) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log(`\n   Total Users: ${stats.total_users}`);
          console.log(`   Total Campaigns: ${stats.total_campaigns}`);
          console.log(`   Total Pledges: ${stats.total_pledges}`);
          console.log(`   Total Wallet Balance: $${stats.total_wallet_balance}`);
          console.log(`   Total Raised: $${stats.total_raised}`);
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
        db.close();
      });
    });
  });
});

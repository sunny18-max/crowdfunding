const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'crowdfunding.db');
const db = new sqlite3.Database(dbPath);

console.log('💰 Checking Wallet Status...\n');
console.log('='.repeat(70));

// Get user info
db.all(`
  SELECT 
    u.id,
    u.name,
    u.email,
    u.wallet_balance,
    COUNT(DISTINCT p.id) as total_pledges,
    COALESCE(SUM(p.amount), 0) as total_pledged_amount
  FROM users u
  LEFT JOIN pledges p ON u.id = p.user_id
  GROUP BY u.id
`, [], (err, users) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  users.forEach(user => {
    console.log(`\n👤 User: ${user.name} (${user.email})`);
    console.log(`   Wallet Balance: $${user.wallet_balance}`);
    console.log(`   Total Pledges: ${user.total_pledges}`);
    console.log(`   Total Pledged Amount: $${user.total_pledged_amount}`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('\n📋 All Pledges:\n');

  // Get all pledges
  db.all(`
    SELECT 
      p.id,
      p.amount,
      p.timestamp,
      u.name as user_name,
      c.title as campaign_title,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM wallet_transactions wt 
          WHERE wt.reference_type = 'pledge' AND wt.reference_id = p.id
        ) THEN '✅ Deducted'
        ELSE '❌ Not Deducted'
      END as wallet_status
    FROM pledges p
    JOIN users u ON p.user_id = u.id
    JOIN campaigns c ON p.campaign_id = c.id
    ORDER BY p.timestamp DESC
  `, [], (err, pledges) => {
    if (err) {
      console.error('Error:', err);
      return;
    }

    if (pledges.length === 0) {
      console.log('No pledges found.');
    } else {
      pledges.forEach((pledge, index) => {
        console.log(`${index + 1}. ${pledge.wallet_status}`);
        console.log(`   User: ${pledge.user_name}`);
        console.log(`   Campaign: ${pledge.campaign_title}`);
        console.log(`   Amount: $${pledge.amount}`);
        console.log(`   Date: ${pledge.timestamp}`);
        console.log('');
      });
    }

    console.log('='.repeat(70));
    console.log('\n💡 Solution:');
    console.log('   If pledges show "❌ Not Deducted", you have two options:');
    console.log('   1. Add more funds to your wallet, then run: node fix-old-pledges.js');
    console.log('   2. Or just make new pledges (they will auto-deduct)');
    console.log('\n');

    db.close();
  });
});

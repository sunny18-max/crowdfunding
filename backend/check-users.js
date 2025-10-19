const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/crowdfunding.db');

console.log('👥 Checking all users in database...\n');

db.all('SELECT id, name, email, wallet_balance, created_at FROM users', (err, users) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  if (users.length === 0) {
    console.log('❌ No users found in database!');
  } else {
    console.log(`Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Wallet: $${user.wallet_balance}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });
  }
  
  db.close();
});

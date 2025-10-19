const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/crowdfunding.db');

console.log('📊 Checking Database Schema...\n');

db.all('PRAGMA table_info(campaigns)', (err, cols) => {
  console.log('Campaigns table columns:');
  cols.forEach(c => console.log(`  - ${c.name} (${c.type})`));
  
  console.log('\n');
  db.all('PRAGMA table_info(pledges)', (err, cols2) => {
    console.log('Pledges table columns:');
    cols2.forEach(c => console.log(`  - ${c.name} (${c.type})`));
    db.close();
  });
});

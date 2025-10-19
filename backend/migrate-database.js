const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'crowdfunding.db');

console.log('🔄 Starting database migration...');

// Check if database exists
if (fs.existsSync(dbPath)) {
  const db = new sqlite3.Database(dbPath);
  
  // Check if wallet_balance column exists
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error('Error checking table:', err);
      return;
    }
    
    const hasWalletBalance = columns.some(col => col.name === 'wallet_balance');
    
    if (!hasWalletBalance) {
      console.log('📝 Adding wallet_balance column to users table...');
      
      db.run(`ALTER TABLE users ADD COLUMN wallet_balance REAL DEFAULT 1000.00`, (err) => {
        if (err) {
          console.error('❌ Error adding column:', err);
        } else {
          console.log('✅ wallet_balance column added successfully!');
        }
      });
      
      db.run(`ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('❌ Error adding updated_at column:', err);
        } else {
          console.log('✅ updated_at column added successfully!');
        }
      });
    } else {
      console.log('✅ wallet_balance column already exists!');
    }
    
    // Check if wallet_transactions table exists
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='wallet_transactions'", (err, tables) => {
      if (err) {
        console.error('Error checking tables:', err);
        return;
      }
      
      if (tables.length === 0) {
        console.log('📝 Creating wallet_transactions table...');
        
        db.run(`
          CREATE TABLE wallet_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            transaction_type TEXT NOT NULL CHECK(transaction_type IN ('debit', 'credit', 'refund', 'withdrawal')),
            amount REAL NOT NULL CHECK(amount > 0),
            balance_before REAL NOT NULL,
            balance_after REAL NOT NULL,
            reference_type TEXT CHECK(reference_type IN ('pledge', 'refund', 'campaign_payout', 'deposit')),
            reference_id INTEGER,
            description TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('❌ Error creating wallet_transactions table:', err);
          } else {
            console.log('✅ wallet_transactions table created successfully!');
          }
          
          db.close(() => {
            console.log('🎉 Migration completed!');
          });
        });
      } else {
        console.log('✅ wallet_transactions table already exists!');
        db.close(() => {
          console.log('🎉 Migration completed!');
        });
      }
    });
  });
} else {
  console.log('ℹ️  Database does not exist yet. It will be created on first run.');
}

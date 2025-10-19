const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'database', 'crowdfunding.db');
const db = new sqlite3.Database(dbPath);

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = {
      name: 'Saathvik',
      email: 'saathvikk202@gmail.com',
      password: hashedPassword,
      wallet_balance: 10000.00
    };

    db.run(
      `INSERT INTO users (name, email, password, wallet_balance) 
       VALUES (?, ?, ?, ?)`,
      [user.name, user.email, user.password, user.wallet_balance],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            console.log('✅ User already exists!');
          } else {
            console.error('❌ Error:', err.message);
          }
        } else {
          console.log('✅ Test user created successfully!');
          console.log('📧 Email: saathvikk202@gmail.com');
          console.log('🔑 Password: password123');
          console.log('💰 Wallet Balance: $10,000');
        }
        db.close();
      }
    );
  } catch (error) {
    console.error('Error:', error);
    db.close();
  }
}

createTestUser();

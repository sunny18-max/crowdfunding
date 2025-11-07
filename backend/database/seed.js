const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { getSeedData } = require('./seedData');

const dbPath = path.join(__dirname, 'crowdfunding.db');
const db = new sqlite3.Database(dbPath);

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    const { users, campaigns, pledges } = await getSeedData();

    // Enable foreign keys
    await runQuery('PRAGMA foreign_keys = ON');

    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...');
    try {
      await runQuery('DELETE FROM pledges');
    } catch (e) {
      console.log('Note: pledges table might be empty or not exist yet');
    }
    try {
      await runQuery('DELETE FROM wallet_transactions');
    } catch (e) {
      console.log('Note: wallet_transactions table might be empty or not exist yet');
    }
    try {
      await runQuery('DELETE FROM campaigns');
    } catch (e) {
      console.log('Note: campaigns table might be empty or not exist yet');
    }
    try {
      await runQuery('DELETE FROM users WHERE email != ?', ['vardhan@gmail.com']); // Keep your existing user
    } catch (e) {
      console.log('Note: users table might be empty or not exist yet');
    }

    // Reset auto-increment counters
    await runQuery('DELETE FROM sqlite_sequence WHERE name IN ("users", "campaigns", "pledges", "wallet_transactions")');

    // Insert users
    console.log('👥 Inserting users...');
    for (const user of users) {
      await runQuery(
        `INSERT INTO users (name, email, password, role, wallet_balance, bio, phone, location, is_verified) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.name, user.email, user.password, user.role, user.wallet_balance, user.bio, user.phone, user.location, user.is_verified]
      );
    }
    console.log(`✅ Inserted ${users.length} users`);

    // Insert campaigns
    console.log('🚀 Inserting campaigns...');
    for (const campaign of campaigns) {
      await runQuery(
        `INSERT INTO campaigns (title, description, goal_amount, current_funds, deadline, creator_id, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [campaign.title, campaign.description, campaign.goal_amount, campaign.current_funds, campaign.deadline, campaign.creator_id, campaign.status]
      );
    }
    console.log(`✅ Inserted ${campaigns.length} campaigns`);

    // Insert pledges and wallet transactions
    console.log('💰 Inserting pledges and transactions...');
    for (const pledge of pledges) {
      // Insert pledge (historical data - balances already adjusted)
      await runQuery(
        `INSERT INTO pledges (user_id, campaign_id, amount, status, timestamp) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [pledge.user_id, pledge.campaign_id, pledge.amount, pledge.status]
      );

      // Insert wallet transaction (for history)
      // Note: We're not actually deducting from balance since this is historical data
      // The user's initial wallet_balance already accounts for these pledges
      await runQuery(
        `INSERT INTO wallet_transactions (user_id, transaction_type, amount, balance_before, balance_after, description, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          pledge.user_id,
          'debit',
          pledge.amount,
          0, // Placeholder - historical data
          0, // Placeholder - historical data
          `Pledge to campaign #${pledge.campaign_id}`
        ]
      );
    }
    console.log(`✅ Inserted ${pledges.length} pledges and transactions`);

    // Insert some activity logs (if table exists)
    console.log('📊 Inserting activity logs...');
    try {
      for (let i = 1; i <= users.length; i++) {
        await runQuery(
          `INSERT INTO user_activity_log (user_id, activity_type, activity_description, ip_address, timestamp) 
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [i, 'register', `User registered with role: ${users[i-1].role}`, '127.0.0.1']
        );
      }
    } catch (e) {
      console.log('Note: user_activity_log table not found, skipping...');
    }

    // Add some notifications (if table exists)
    console.log('🔔 Inserting notifications...');
    try {
      await runQuery(
        `INSERT INTO notifications (user_id, type, title, message, is_read) 
         VALUES (2, 'success', 'Campaign Funded!', 'Your campaign "Pixel Quest" has been successfully funded!', 1)`,
        []
      );
      await runQuery(
        `INSERT INTO notifications (user_id, type, title, message, is_read) 
         VALUES (3, 'info', 'New Pledge', 'You received a new pledge of $25,000 for RoboLearn!', 0)`,
        []
      );
    } catch (e) {
      console.log('Note: notifications table not found, skipping...');
    }

    console.log('✅ Database seeding completed successfully! 🎉');
    console.log('\n📝 Sample Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:        admin@fundstarter.com / password123');
    console.log('Entrepreneur: sarah.johnson@example.com / password123');
    console.log('Entrepreneur: michael.chen@example.com / password123');
    console.log('Investor:     david.park@example.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    db.close(() => {
      console.log('Database connection closed');
      process.exit(0);
    });
  }
}

// Helper functions
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Run the seeder
seedDatabase();

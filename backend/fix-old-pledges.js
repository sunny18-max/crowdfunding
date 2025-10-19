const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'crowdfunding.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Processing old pledges without wallet deductions...\n');

// Get all pledges that don't have corresponding wallet transactions
db.all(`
  SELECT 
    p.id,
    p.user_id,
    p.campaign_id,
    p.amount,
    p.timestamp,
    c.title as campaign_title,
    u.name as user_name,
    u.wallet_balance
  FROM pledges p
  JOIN campaigns c ON p.campaign_id = c.id
  JOIN users u ON p.user_id = u.id
  WHERE NOT EXISTS (
    SELECT 1 FROM wallet_transactions wt 
    WHERE wt.reference_type = 'pledge' 
    AND wt.reference_id = p.id
  )
  ORDER BY p.timestamp ASC
`, [], (err, pledges) => {
  if (err) {
    console.error('❌ Error fetching pledges:', err);
    return;
  }

  if (pledges.length === 0) {
    console.log('✅ No old pledges to process. All pledges are already in wallet transactions!');
    db.close();
    return;
  }

  console.log(`📋 Found ${pledges.length} old pledge(s) to process:\n`);

  pledges.forEach((pledge, index) => {
    console.log(`${index + 1}. ${pledge.user_name} pledged $${pledge.amount} to "${pledge.campaign_title}"`);
  });

  console.log('\n⚠️  WARNING: This will deduct money from user wallets retroactively!');
  console.log('⚠️  Make sure users have sufficient balance or this will fail.\n');

  // Process each pledge
  let processed = 0;
  let failed = 0;

  pledges.forEach((pledge, index) => {
    db.serialize(() => {
      // Start transaction
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          console.error(`❌ Failed to start transaction for pledge ${pledge.id}:`, err);
          failed++;
          return;
        }

        // Check if user has sufficient balance
        if (pledge.wallet_balance < pledge.amount) {
          console.log(`⚠️  Skipping pledge ${pledge.id}: User ${pledge.user_name} has insufficient balance ($${pledge.wallet_balance} < $${pledge.amount})`);
          db.run('ROLLBACK');
          failed++;
          return;
        }

        // 1. Deduct from wallet
        db.run(
          'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?',
          [pledge.amount, pledge.user_id],
          (err) => {
            if (err) {
              console.error(`❌ Failed to deduct from wallet for pledge ${pledge.id}:`, err);
              db.run('ROLLBACK');
              failed++;
              return;
            }

            // 2. Create wallet transaction
            db.run(
              `INSERT INTO wallet_transactions 
              (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description, timestamp) 
              VALUES (?, 'debit', ?, ?, ?, 'pledge', ?, ?, ?)`,
              [
                pledge.user_id,
                pledge.amount,
                pledge.wallet_balance,
                pledge.wallet_balance - pledge.amount,
                pledge.id,
                `Pledge to campaign: ${pledge.campaign_title}`,
                pledge.timestamp
              ],
              (err) => {
                if (err) {
                  console.error(`❌ Failed to create wallet transaction for pledge ${pledge.id}:`, err);
                  db.run('ROLLBACK');
                  failed++;
                  return;
                }

                // 3. Update transaction status to committed
                db.run(
                  'UPDATE transactions SET status = "committed", processed_at = ? WHERE pledge_id = ?',
                  [pledge.timestamp, pledge.id],
                  (err) => {
                    if (err) {
                      console.error(`❌ Failed to update transaction status for pledge ${pledge.id}:`, err);
                      db.run('ROLLBACK');
                      failed++;
                      return;
                    }

                    // Commit transaction
                    db.run('COMMIT', (err) => {
                      if (err) {
                        console.error(`❌ Failed to commit transaction for pledge ${pledge.id}:`, err);
                        db.run('ROLLBACK');
                        failed++;
                        return;
                      }

                      processed++;
                      console.log(`✅ Processed pledge ${pledge.id}: $${pledge.amount} deducted from ${pledge.user_name}'s wallet`);

                      // If this is the last pledge, show summary
                      if (index === pledges.length - 1) {
                        setTimeout(() => {
                          console.log('\n' + '='.repeat(60));
                          console.log('📊 SUMMARY:');
                          console.log('='.repeat(60));
                          console.log(`✅ Successfully processed: ${processed}`);
                          console.log(`❌ Failed/Skipped: ${failed}`);
                          console.log('='.repeat(60));
                          console.log('\n🎉 Migration complete! Check your wallet and transaction history.');
                          db.close();
                        }, 500);
                      }
                    });
                  }
                );
              }
            );
          }
        );
      });
    });
  });
});

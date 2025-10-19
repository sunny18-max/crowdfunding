const cron = require('node-cron');
const db = require('../database/dbHelper');

// Process expired campaigns
async function processExpiredCampaigns() {
  console.log('🔍 Checking for expired campaigns...');

  try {
    // Find all active campaigns that have passed their deadline
    const expiredCampaigns = await db.all(`
      SELECT * FROM campaigns 
      WHERE status = 'active' 
      AND datetime(deadline) <= datetime('now')
    `);

    if (!expiredCampaigns || expiredCampaigns.length === 0) {
      console.log('✅ No expired campaigns to process');
      return;
    }

    console.log(`📋 Found ${expiredCampaigns.length} expired campaign(s) to process`);

    for (const campaign of expiredCampaigns) {
      await processCampaign(campaign);
    }

  } catch (error) {
    console.error('❌ Error processing expired campaigns:', error);
  }
}

// Process a single campaign
async function processCampaign(campaign) {
  console.log(`\n🎯 Processing campaign: ${campaign.title} (ID: ${campaign.id})`);
  console.log(`   Goal: $${campaign.goal_amount} | Pledged: $${campaign.total_pledged}`);

  const goalMet = campaign.total_pledged >= campaign.goal_amount;

  try {
    // Use SQLite transaction for atomic operation
    await db.transaction(async () => {
      if (goalMet) {
        // COMMIT: Goal met - mark campaign as successful
        console.log('   ✅ Goal met! Committing transactions...');

        // Update campaign status to successful
        await db.run(`
          UPDATE campaigns 
          SET status = 'successful' 
          WHERE id = ?
        `, [campaign.id]);

        // Update all pending transactions to committed
        await db.run(`
          UPDATE transactions 
          SET status = 'committed', processed_at = CURRENT_TIMESTAMP
          WHERE pledge_id IN (
            SELECT id FROM pledges WHERE campaign_id = ?
          )
          AND status = 'pending'
        `, [campaign.id]);

        console.log('   💰 Funds transferred to campaign creator');

      } else {
        // ROLLBACK: Goal not met - mark campaign as failed
        console.log('   ❌ Goal not met. Rolling back transactions...');

        // Update campaign status to failed
        await db.run(`
          UPDATE campaigns 
          SET status = 'failed' 
          WHERE id = ?
        `, [campaign.id]);

        // Update all pending transactions to rolled_back
        await db.run(`
          UPDATE transactions 
          SET status = 'rolled_back', processed_at = CURRENT_TIMESTAMP
          WHERE pledge_id IN (
            SELECT id FROM pledges WHERE campaign_id = ?
          )
          AND status = 'pending'
        `, [campaign.id]);

        console.log('   💸 Pledges refunded to backers');
      }
    });

    console.log(`   ✔️  Campaign ${campaign.id} processed successfully`);
  } catch (error) {
    console.error(`   ❌ Error processing campaign ${campaign.id}:`, error);
  }
}

// Manual trigger endpoint helper
async function manualProcessExpiredCampaigns() {
  try {
    await processExpiredCampaigns();
    return { message: 'Expired campaigns processed successfully' };
  } catch (error) {
    throw error;
  }
}

// Start the cron job
function startDeadlineChecker() {
  // Run every minute
  cron.schedule('* * * * *', () => {
    processExpiredCampaigns().catch(err => {
      console.error('Error in cron job:', err);
    });
  });

  console.log('⏰ Deadline checker started - running every minute');

  // Run once on startup (after a delay to let DB initialize)
  setTimeout(() => {
    processExpiredCampaigns().catch(err => {
      console.error('Error in initial check:', err);
    });
  }, 2000);
}

module.exports = {
  startDeadlineChecker,
  manualProcessExpiredCampaigns,
  processExpiredCampaigns
};

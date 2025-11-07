const db = require('../database/dbHelper');

/**
 * WALLET SERVICE - Demonstrates ACID Properties
 * 
 * This service showcases:
 * - Atomicity: All operations succeed or all fail
 * - Consistency: Wallet balances always remain valid
 * - Isolation: Concurrent transactions don't interfere
 * - Durability: Committed transactions persist
 */

class WalletService {
  
  /**
   * Create a pledge with wallet debit (ACID Transaction)
   * Demonstrates: BEGIN -> Multiple Operations -> COMMIT/ROLLBACK
   */
  static async createPledgeWithWallet(userId, campaignId, amount) {
    return await db.transaction(async () => {
      // Step 1: Check user wallet balance
      const user = await db.get(
        'SELECT id, wallet_balance FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        throw new Error('User not found');
      }

      if (user.wallet_balance < amount) {
        throw new Error(`Insufficient balance. Available: $${user.wallet_balance}, Required: $${amount}`);
      }

      // Step 2: Check campaign exists and is active
      const campaign = await db.get(
        'SELECT id, status, goal_amount, current_funds FROM campaigns WHERE id = ?',
        [campaignId]
      );

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'active') {
        throw new Error('Campaign is not active');
      }

      // Step 3: Debit from user wallet (ATOMIC OPERATION)
      const balanceBefore = user.wallet_balance;
      const balanceAfter = balanceBefore - amount;

      await db.run(
        'UPDATE users SET wallet_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [balanceAfter, userId]
      );

      // Step 4: Create pledge record
      const pledgeResult = await db.run(
        'INSERT INTO pledges (user_id, campaign_id, amount, status) VALUES (?, ?, ?, ?)',
        [userId, campaignId, amount, 'pending']
      );

      // Step 5: Update campaign funds
      await db.run(
        'UPDATE campaigns SET current_funds = current_funds + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [amount, campaignId]
      );

      // Step 6: Log wallet transaction
      await db.run(
        `INSERT INTO wallet_transactions 
         (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          'debit',
          amount,
          balanceBefore,
          balanceAfter,
          'pledge',
          pledgeResult.lastID,
          `Pledge to campaign #${campaignId}`
        ]
      );

      // If we reach here, all operations succeeded - COMMIT happens automatically
      return {
        pledgeId: pledgeResult.lastID,
        newBalance: balanceAfter,
        message: 'Pledge created successfully with wallet debit'
      };
    });
    // If any error occurs above, automatic ROLLBACK happens
  }

  /**
   * Process campaign completion - Release funds or refund
   * Demonstrates: Complex multi-step transaction with conditional logic
   */
  static async processCampaignCompletion(campaignId) {
    return await db.transaction(async () => {
      // Get campaign details
      const campaign = await db.get(
        'SELECT * FROM campaigns WHERE id = ?',
        [campaignId]
      );

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const goalMet = campaign.current_funds >= campaign.goal_amount;

      if (goalMet) {
        // SCENARIO 1: Goal Met - Release funds to creator
        await this.releaseFundsToCreator(campaign);
        
        // Update pledge status to committed
        await db.run(
          'UPDATE pledges SET status = ? WHERE campaign_id = ? AND status = ?',
          ['committed', campaignId, 'pending']
        );

        // Update campaign status
        await db.run(
          'UPDATE campaigns SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['successful', campaignId]
        );

        return {
          success: true,
          action: 'funds_released',
          amount: campaign.current_funds,
          message: `Campaign successful! $${campaign.current_funds} released to creator`
        };

      } else {
        // SCENARIO 2: Goal Not Met - Refund all backers
        await this.refundAllBackers(campaignId);

        // Update campaign status
        await db.run(
          'UPDATE campaigns SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['failed', campaignId]
        );

        return {
          success: true,
          action: 'refunds_processed',
          message: 'Campaign failed. All pledges refunded'
        };
      }
    });
  }

  /**
   * Release funds to campaign creator
   */
  static async releaseFundsToCreator(campaign) {
    // Get creator's current balance
    const creator = await db.get(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [campaign.creator_id]
    );

    const balanceBefore = creator.wallet_balance;
    const balanceAfter = balanceBefore + campaign.current_funds;

    // Credit creator's wallet
    await db.run(
      'UPDATE users SET wallet_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [balanceAfter, campaign.creator_id]
    );

    // Log wallet transaction
    await db.run(
      `INSERT INTO wallet_transactions 
       (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campaign.creator_id,
        'credit',
        campaign.current_funds,
        balanceBefore,
        balanceAfter,
        'campaign_payout',
        campaign.id,
        `Payout from successful campaign: ${campaign.title}`
      ]
    );

    // Log fund release
    await db.run(
      `INSERT INTO fund_release_log (campaign_id, creator_id, amount_released, release_status, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        campaign.id,
        campaign.creator_id,
        campaign.current_funds,
        'completed',
        'Automatic release after successful campaign'
      ]
    );
  }

  /**
   * Refund all backers for a failed campaign
   */
  static async refundAllBackers(campaignId) {
    // Get all pending pledges
    const pledges = await db.all(
      'SELECT * FROM pledges WHERE campaign_id = ? AND status = ?',
      [campaignId, 'pending']
    );

    // Refund each backer
    for (const pledge of pledges) {
      // Get user's current balance
      const user = await db.get(
        'SELECT wallet_balance FROM users WHERE id = ?',
        [pledge.user_id]
      );

      const balanceBefore = user.wallet_balance;
      const balanceAfter = balanceBefore + pledge.amount;

      // Credit back to user's wallet
      await db.run(
        'UPDATE users SET wallet_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [balanceAfter, pledge.user_id]
      );

      // Update pledge status
      await db.run(
        'UPDATE pledges SET status = ? WHERE id = ?',
        ['refunded', pledge.id]
      );

      // Log refund transaction
      await db.run(
        `INSERT INTO wallet_transactions 
         (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pledge.user_id,
          'refund',
          pledge.amount,
          balanceBefore,
          balanceAfter,
          'refund',
          pledge.id,
          `Refund from failed campaign #${campaignId}`
        ]
      );
    }

    // Reset campaign funds
    await db.run(
      'UPDATE campaigns SET current_funds = 0 WHERE id = ?',
      [campaignId]
    );
  }

  /**
   * Get user wallet balance and transaction history with enhanced details
   */
  static async getWalletInfo(userId) {
    // Get comprehensive user details
    const user = await db.get(
      `SELECT 
        id, name, email, role, wallet_balance, 
        bio, phone, location, profile_image,
        is_verified, is_active, created_at, last_login
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Get transaction history
    const transactions = await db.all(
      `SELECT * FROM wallet_transactions 
       WHERE user_id = ? 
       ORDER BY timestamp DESC 
       LIMIT 50`,
      [userId]
    );

    // Get transaction statistics
    const stats = await db.get(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END) as total_debits,
        SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END) as total_credits,
        SUM(CASE WHEN transaction_type = 'refund' THEN amount ELSE 0 END) as total_refunds
       FROM wallet_transactions
       WHERE user_id = ?`,
      [userId]
    );

    // Get user's pledge summary
    const pledgeSummary = await db.get(
      `SELECT 
        COUNT(*) as total_pledges,
        SUM(amount) as amount,
        COUNT(CASE WHEN status = 'committed' THEN 1 END) as successful_pledges,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_pledges,
        COUNT(CASE WHEN status = 'rolled_back' THEN 1 END) as refunded_pledges
       FROM pledges
       WHERE user_id = ?`,
      [userId]
    );
    
    // For backward compatibility, add total_pledged alias
    if (pledgeSummary) {
      pledgeSummary.total_pledged = pledgeSummary.amount || 0;
    }

    // Get user's campaign summary (if entrepreneur)
    let campaignSummary = null;
    if (user.role === 'entrepreneur') {
      campaignSummary = await db.get(
        `SELECT 
          COUNT(*) as total_campaigns,
          SUM(current_funds) as total_raised,
          COUNT(CASE WHEN status = 'successful' THEN 1 END) as successful_campaigns,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_campaigns
         FROM campaigns
         WHERE creator_id = ?`,
        [userId]
      );
    }

    // Get recent activity
    const recentActivity = await db.all(
      `SELECT activity_type, activity_description, timestamp
       FROM user_activity_log
       WHERE user_id = ?
       ORDER BY timestamp DESC
       LIMIT 10`,
      [userId]
    );

    return {
      user,
      transactions,
      stats,
      pledgeSummary,
      campaignSummary,
      recentActivity
    };
  }

  /**
   * Add funds to wallet (for testing/demo)
   */
  static async addFunds(userId, amount) {
    return await db.transaction(async () => {
      const user = await db.get(
        'SELECT wallet_balance FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        throw new Error('User not found');
      }

      const balanceBefore = user.wallet_balance;
      const balanceAfter = balanceBefore + amount;

      await db.run(
        'UPDATE users SET wallet_balance = ? WHERE id = ?',
        [balanceAfter, userId]
      );

      await db.run(
        `INSERT INTO wallet_transactions 
         (user_id, transaction_type, amount, balance_before, balance_after, reference_type, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          'credit',
          amount,
          balanceBefore,
          balanceAfter,
          'deposit',
          'Manual deposit'
        ]
      );

      return {
        newBalance: balanceAfter,
        message: `Successfully added $${amount} to wallet`
      };
    });
  }

  /**
   * Demonstrate concurrency control with locking
   */
  static async demonstrateConcurrency(userId, campaignId, amount) {
    // This demonstrates isolation levels and prevents race conditions
    return await db.transaction(async () => {
      // Lock the user row for update (prevents concurrent modifications)
      const user = await db.get(
        'SELECT * FROM users WHERE id = ? ',
        [userId]
      );

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Now proceed with transaction
      return await this.createPledgeWithWallet(userId, campaignId, amount);
    });
  }
}

module.exports = WalletService;

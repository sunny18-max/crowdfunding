const db = require('../database/dbHelper');

// Create a new pledge (with transaction)
exports.createPledge = async (req, res, next) => {
  try {
    const { campaign_id, amount } = req.body;
    const user_id = req.user.userId;

    // Validate input
    if (!campaign_id || !amount) {
      return res.status(400).json({ error: 'Please provide campaign_id and amount' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Check if campaign exists and is active
    const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [campaign_id]);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({ error: 'Campaign is not active' });
    }

    if (new Date(campaign.deadline) < new Date()) {
      return res.status(400).json({ error: 'Campaign deadline has passed' });
    }

    if (campaign.creator_id === user_id) {
      return res.status(400).json({ error: 'Cannot pledge to your own campaign' });
    }

    // Check if user has sufficient wallet balance
    const user = await db.get('SELECT wallet_balance FROM users WHERE id = ?', [user_id]);
    
    if (!user || user.wallet_balance < amount) {
      return res.status(400).json({ 
        error: 'Insufficient wallet balance',
        required: amount,
        available: user?.wallet_balance || 0
      });
    }

    // Use transaction for atomic operation (ACID)
    const pledgeId = await db.transaction(async () => {
      // 1. Deduct from user's wallet
      await db.run(
        'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?',
        [amount, user_id]
      );

      // 2. Insert pledge
      const pledgeResult = await db.run(
        'INSERT INTO pledges (user_id, campaign_id, amount) VALUES (?, ?, ?)',
        [user_id, campaign_id, amount]
      );

      // 3. Update campaign current_funds
      await db.run(
        'UPDATE campaigns SET current_funds = current_funds + ? WHERE id = ?',
        [amount, campaign_id]
      );

      // 4. Log wallet transaction (replaces the separate transactions table)
      await db.run(
        `INSERT INTO wallet_transactions 
        (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description) 
        VALUES (?, 'debit', ?, ?, ?, 'pledge', ?, ?)`,
        [
          user_id, 
          amount, 
          user.wallet_balance, 
          user.wallet_balance - amount,
          pledgeResult.lastID,
          `Pledge to campaign: ${campaign.title}`
        ]
      );

      return pledgeResult.lastID;
    });

    // Get the created pledge with details
    const pledge = await db.get(`
      SELECT 
        p.*,
        c.title as campaign_title,
        u.name as backer_name
      FROM pledges p
      LEFT JOIN campaigns c ON p.campaign_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [pledgeId]);

    res.status(201).json({
      message: 'Pledge created successfully',
      pledge
    });
  } catch (error) {
    next(error);
  }
};

// Get pledges by user
exports.getPledgesByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const pledges = await db.all(`
      SELECT 
        p.id,
        p.user_id,
        p.campaign_id,
        p.amount,
        p.status as pledge_status,
        p.timestamp as pledge_date,
        c.title as campaign_title,
        c.status as campaign_status,
        c.goal_amount,
        c.current_funds as total_pledged,
        c.deadline,
        wt.status as transaction_status,
        wt.timestamp as processed_at,
        (c.current_funds * 100.0 / c.goal_amount) as funding_percentage
      FROM pledges p
      LEFT JOIN campaigns c ON p.campaign_id = c.id
      LEFT JOIN wallet_transactions wt ON p.id = wt.reference_id AND wt.reference_type = 'pledge'
      WHERE p.user_id = ?
      ORDER BY p.timestamp DESC
    `, [userId]);

    console.log('Pledges for user', userId, ':', JSON.stringify(pledges, null, 2));

    // Ensure we always return an array, even if empty
    res.json({ pledges: pledges || [] });
  } catch (error) {
    next(error);
  }
};

// Get pledges by campaign
exports.getPledgesByCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;

    const pledges = await db.all(`
      SELECT 
        p.*,
        u.name as backer_name,
        u.email as backer_email,
        t.status as transaction_status,
        t.processed_at
      FROM pledges p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN transactions t ON p.id = t.pledge_id
      WHERE p.campaign_id = ?
      ORDER BY p.timestamp DESC
    `, [campaignId]);

    res.json({ pledges });
  } catch (error) {
    next(error);
  }
};

// Get pledge statistics for a user
exports.getUserPledgeStats = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // First, get the basic pledge stats
    const stats = await db.get(`
      SELECT 
        COUNT(DISTINCT p.id) as total_pledges,
        COALESCE(SUM(p.amount), 0) as total_amount_pledged,
        COUNT(DISTINCT CASE WHEN c.status = 'successful' THEN p.id END) as successful_pledges,
        COUNT(DISTINCT CASE WHEN c.status = 'failed' THEN p.id END) as failed_pledges,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN p.id END) as active_pledges
      FROM pledges p
      LEFT JOIN campaigns c ON p.campaign_id = c.id
      WHERE p.user_id = ?
    `, [userId]);

    // Then get the total invested from wallet transactions
    const invested = await db.get(`
      SELECT COALESCE(SUM(amount), 0) as total_invested
      FROM wallet_transactions 
      WHERE user_id = ? 
      AND transaction_type = 'debit' 
      AND reference_type = 'pledge'
    `, [userId]);

    // Combine the results
    Object.assign(stats, invested);

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

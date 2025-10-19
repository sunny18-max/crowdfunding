const db = require('../database/dbHelper');

// Get all campaigns
exports.getAllCampaigns = async (req, res, next) => {
  try {
    const campaigns = await db.all(`
      SELECT 
        c.*,
        u.name as creator_name,
        u.email as creator_email,
        COUNT(DISTINCT p.id) as backers_count
      FROM campaigns c
      LEFT JOIN users u ON c.creator_id = u.id
      LEFT JOIN pledges p ON c.id = p.campaign_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    // Calculate progress percentage for each campaign
    const campaignsWithProgress = campaigns.map(campaign => ({
      ...campaign,
      progress_percentage: campaign.goal_amount > 0 
        ? Math.min((campaign.total_pledged / campaign.goal_amount) * 100, 100).toFixed(2)
        : 0,
      is_expired: new Date(campaign.deadline) < new Date(),
      days_remaining: Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    }));

    res.json({ campaigns: campaignsWithProgress });
  } catch (error) {
    next(error);
  }
};

// Get campaign by ID
exports.getCampaignById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const campaign = await db.get(`
      SELECT 
        c.*,
        u.name as creator_name,
        u.email as creator_email
      FROM campaigns c
      LEFT JOIN users u ON c.creator_id = u.id
      WHERE c.id = ?
    `, [id]);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get backers
    const backers = await db.all(`
      SELECT 
        p.id,
        p.amount,
        p.timestamp,
        u.name as backer_name,
        t.status as transaction_status
      FROM pledges p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN transactions t ON p.id = t.pledge_id
      WHERE p.campaign_id = ?
      ORDER BY p.timestamp DESC
    `, [id]);

    // Calculate additional info
    campaign.progress_percentage = campaign.goal_amount > 0 
      ? Math.min((campaign.total_pledged / campaign.goal_amount) * 100, 100).toFixed(2)
      : 0;
    campaign.is_expired = new Date(campaign.deadline) < new Date();
    campaign.days_remaining = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    campaign.backers_count = backers.length;
    campaign.backers = backers;

    res.json({ campaign });
  } catch (error) {
    next(error);
  }
};

// Create new campaign
exports.createCampaign = async (req, res, next) => {
  try {
    const { title, description, goal_amount, deadline } = req.body;
    const creator_id = req.user.userId;

    // Validate input
    if (!title || !description || !goal_amount || !deadline) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (goal_amount <= 0) {
      return res.status(400).json({ error: 'Goal amount must be greater than 0' });
    }

    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({ error: 'Deadline must be in the future' });
    }

    // Insert campaign
    const result = await db.run(`
      INSERT INTO campaigns (title, description, goal_amount, deadline, creator_id)
      VALUES (?, ?, ?, ?, ?)
    `, [title, description, goal_amount, deadline, creator_id]);

    const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign
    });
  } catch (error) {
    next(error);
  }
};

// Get campaigns by user
exports.getCampaignsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const campaigns = await db.all(`
      SELECT 
        c.*,
        COUNT(DISTINCT p.id) as backers_count
      FROM campaigns c
      LEFT JOIN pledges p ON c.id = p.campaign_id
      WHERE c.creator_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [userId]);

    const campaignsWithProgress = campaigns.map(campaign => ({
      ...campaign,
      progress_percentage: campaign.goal_amount > 0 
        ? Math.min((campaign.total_pledged / campaign.goal_amount) * 100, 100).toFixed(2)
        : 0,
      is_expired: new Date(campaign.deadline) < new Date(),
      days_remaining: Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    }));

    res.json({ campaigns: campaignsWithProgress });
  } catch (error) {
    next(error);
  }
};

// Update campaign
exports.updateCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, goal_amount, deadline } = req.body;
    const userId = req.user.userId;

    // Check if campaign exists and user is the creator
    const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [id]);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.creator_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this campaign' });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({ error: 'Cannot update a completed campaign' });
    }

    // Update campaign
    await db.run(`
      UPDATE campaigns 
      SET title = ?, description = ?, goal_amount = ?, deadline = ?
      WHERE id = ?
    `, [title, description, goal_amount, deadline, id]);

    const updatedCampaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [id]);

    res.json({
      message: 'Campaign updated successfully',
      campaign: updatedCampaign
    });
  } catch (error) {
    next(error);
  }
};

// Delete campaign
exports.deleteCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if campaign exists and user is the creator
    const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [id]);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.creator_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this campaign' });
    }

    // Delete campaign (cascades to pledges and transactions)
    await db.run('DELETE FROM campaigns WHERE id = ?', [id]);

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    next(error);
  }
};

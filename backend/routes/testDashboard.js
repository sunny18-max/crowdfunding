const express = require('express');
const router = express.Router();
const db = require('../database/dbHelper');
const auth = require('../middleware/auth');

// Test endpoint to check entrepreneur dashboard data
router.get('/test-entrepreneur-dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // 1. First, check if the user exists and is an entrepreneur
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`Testing dashboard for user: ${user.email} (${user.role})`);
    
    // 2. Get basic stats
    const stats = await db.get(
      `SELECT 
        COUNT(DISTINCT c.id) as total_campaigns,
        SUM(CASE WHEN c.status = 'active' THEN 1 ELSE 0) as active_campaigns,
        SUM(CASE WHEN c.status = 'successful' THEN 1 ELSE 0) as successful_campaigns,
        COALESCE(SUM(c.current_funds), 0) as total_raised,
        COUNT(DISTINCT p.user_id) as total_backers
      FROM users u
      LEFT JOIN campaigns c ON u.id = c.creator_id
      LEFT JOIN pledges p ON c.id = p.campaign_id
      WHERE u.id = ?`,
      [userId]
    ) || {
      total_campaigns: 0,
      active_campaigns: 0,
      successful_campaigns: 0,
      total_raised: 0,
      total_backers: 0
    };
    
    // 3. Get campaigns with simplified query
    const campaigns = await db.all(
      `SELECT 
        c.*,
        COALESCE((SELECT COUNT(*) FROM pledges WHERE campaign_id = c.id), 0) as total_backers,
        0 as avg_pledge_amount,
        0 as funding_percentage,
        0 as comment_count,
        0 as update_count
      FROM campaigns c
      WHERE c.creator_id = ?
      ORDER BY c.created_at DESC`,
      [userId]
    ) || [];
    
    // 4. Get recent pledges (simplified)
    const recentPledges = await db.all(
      `SELECT 
        p.*,
        u.name as backer_name,
        u.email as backer_email,
        c.title as campaign_title
      FROM pledges p
      JOIN users u ON p.user_id = u.id
      JOIN campaigns c ON p.campaign_id = c.id
      WHERE c.creator_id = ?
      ORDER BY p.timestamp DESC
      LIMIT 5`,
      [userId]
    ) || [];
    
    res.json({
      success: true,
      stats: {
        ...stats,
        user_id: userId,
        name: user.name,
        email: user.email
      },
      campaigns,
      recentPledges,
      notifications: []
    });
    
  } catch (error) {
    console.error('Test dashboard error:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.userId
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        details: error
      } : {})
    });
  }
});

module.exports = router;

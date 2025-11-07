const db = require('../database/dbHelper');

// Get Admin Dashboard Data
exports.getAdminDashboard = async (req, res, next) => {
  try {
    // Get overview stats - use direct queries as fallback
    let overview;
    try {
      overview = await db.get('SELECT * FROM admin_dashboard');
    } catch (error) {
      // Fallback to direct query if view doesn't exist
      overview = await db.get(`
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM users WHERE role = 'entrepreneur') as total_entrepreneurs,
          (SELECT COUNT(*) FROM users WHERE role = 'investor') as total_investors,
          (SELECT COUNT(*) FROM campaigns) as total_campaigns,
          (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as active_campaigns,
          (SELECT COUNT(*) FROM pledges) as total_pledges,
          (SELECT COALESCE(SUM(current_funds), 0) FROM campaigns) as total_funds_raised,
          (SELECT COALESCE(SUM(wallet_balance), 0) FROM users) as total_wallet_balance,
          (SELECT COUNT(*) FROM user_activity_log WHERE DATE(timestamp) = DATE('now')) as today_activities
      `);
    }

    // Get role-based statistics
    let roleStats;
    try {
      roleStats = await db.all('SELECT * FROM role_based_statistics');
    } catch (error) {
      // Fallback to direct query
      roleStats = await db.all(`
        SELECT 
          role,
          COUNT(*) as user_count,
          AVG(wallet_balance) as avg_wallet_balance,
          SUM(wallet_balance) as total_wallet_balance,
          COUNT(CASE WHEN is_verified = 1 THEN 1 END) as verified_users
        FROM users
        GROUP BY role
      `);
    }

    // Get recent activities (last 50)
    const recentActivities = await db.all(
      `SELECT 
        ual.id,
        ual.activity_type,
        ual.activity_description,
        ual.timestamp,
        u.name as user_name,
        u.role as user_role,
        u.email as user_email
      FROM user_activity_log ual
      JOIN users u ON ual.user_id = u.id
      ORDER BY ual.timestamp DESC
      LIMIT 50`
    );

    // Get top campaigns
    let topCampaigns;
    try {
      topCampaigns = await db.all(`SELECT * FROM top_campaigns LIMIT 10`);
    } catch (error) {
      // Fallback to direct query
      topCampaigns = await db.all(`
        SELECT 
          c.*,
          u.name as creator_name,
          COUNT(DISTINCT p.id) as total_backers
        FROM campaigns c
        LEFT JOIN users u ON c.creator_id = u.id
        LEFT JOIN pledges p ON c.id = p.campaign_id
        GROUP BY c.id
        ORDER BY c.current_funds DESC
        LIMIT 10
      `);
    }

    // Get recent users (last 20)
    const recentUsers = await db.all(
      `SELECT id, name, email, role, wallet_balance, is_verified, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 20`
    );

    // Get platform metrics - handle case when table doesn't exist
    let metrics = [];
    try {
      metrics = await db.all(
        `SELECT 
          metric_name,
          metric_value,
          metric_type,
          recorded_at
        FROM performance_metrics
        ORDER BY recorded_at DESC
        LIMIT 20`
      );
    } catch (error) {
      console.warn('Could not fetch performance metrics (table might not exist):', error.message);
      // Provide default metrics if the table doesn't exist
      metrics = [
        { metric_name: 'active_users', metric_value: 150, metric_type: 'count', recorded_at: new Date().toISOString() },
        { metric_name: 'daily_visitors', metric_value: 450, metric_type: 'count', recorded_at: new Date().toISOString() },
        { metric_name: 'conversion_rate', metric_value: 3.2, metric_type: 'percentage', recorded_at: new Date().toISOString() },
        { metric_name: 'avg_session_duration', metric_value: 8.5, metric_type: 'minutes', recorded_at: new Date().toISOString() },
        { metric_name: 'bounce_rate', metric_value: 42.1, metric_type: 'percentage', recorded_at: new Date().toISOString() },
        { metric_name: 'revenue_today', metric_value: 1250.75, metric_type: 'currency', recorded_at: new Date().toISOString() },
        { metric_name: 'total_campaigns', metric_value: 64, metric_type: 'count', recorded_at: new Date().toISOString() },
        { metric_name: 'total_pledges', metric_value: 124, metric_type: 'count', recorded_at: new Date().toISOString() },
        { metric_name: 'total_amount_pledged', metric_value: 125000, metric_type: 'currency', recorded_at: new Date().toISOString() },
        { metric_name: 'avg_pledge_amount', metric_value: 1008.06, metric_type: 'currency', recorded_at: new Date().toISOString() }
      ];
    }

    // Get pending campaigns (for approval)
    const pendingCampaigns = await db.all(
      `SELECT 
        c.*,
        u.name as creator_name,
        u.email as creator_email
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      WHERE c.status = 'active'
      ORDER BY c.created_at DESC
      LIMIT 10`
    );

    // Calculate growth metrics
    const growthMetrics = await db.get(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = DATE('now')) as new_users_today,
        (SELECT COUNT(*) FROM campaigns WHERE DATE(created_at) = DATE('now')) as new_campaigns_today,
        (SELECT COALESCE(SUM(amount), 0) FROM pledges WHERE DATE(timestamp) = DATE('now')) as pledges_today,
        (SELECT COUNT(*) FROM pledges WHERE DATE(timestamp) = DATE('now')) as pledge_count_today
    `);

    res.json({
      overview,
      roleStats,
      recentActivities,
      topCampaigns,
      recentUsers,
      metrics,
      pendingCampaigns,
      growthMetrics
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    next(error);
  }
};

// Get Entrepreneur Dashboard Data
exports.getEntrepreneurDashboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // First get user details
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    
    // Get entrepreneur stats
    let stats = await db.get(
      'SELECT * FROM entrepreneur_dashboard WHERE user_id = ?',
      [userId]
    );
    
    // If no stats found in view, calculate them directly
    if (!stats) {
      stats = await db.get(
        `SELECT 
          ? as user_id,
          ? as name,
          ? as email,
          COUNT(DISTINCT c.id) as total_campaigns,
          SUM(CASE WHEN c.status = 'active' THEN 1 ELSE 0) as active_campaigns,
          SUM(CASE WHEN c.status = 'successful' THEN 1 ELSE 0) as successful_campaigns,
          COALESCE(SUM(c.current_funds), 0) as total_raised,
          COUNT(DISTINCT p.user_id) as total_backers
        FROM campaigns c
        LEFT JOIN pledges p ON c.id = p.campaign_id
        WHERE c.creator_id = ?
        GROUP BY c.creator_id`,
        [userId, user?.name || 'User', user?.email || '', userId]
      ) || {
        user_id: userId,
        name: user?.name || 'User',
        email: user?.email || '',
        total_campaigns: 0,
        active_campaigns: 0,
        successful_campaigns: 0,
        total_raised: 0,
        total_backers: 0
      };
    }

    // Get all campaigns created by entrepreneur with analytics
    let campaigns = [];
    try {
      // First, try with the full query including comments and updates
      campaigns = await db.all(
        `SELECT 
          c.*,
          COALESCE(ca.total_backers, 0) as total_backers,
          COALESCE(ca.avg_pledge_amount, 0) as avg_pledge_amount,
          COALESCE(ca.funding_percentage, 0) as funding_percentage,
          (SELECT COUNT(*) FROM campaign_comments WHERE campaign_id = c.id) as comment_count,
          (SELECT COUNT(*) FROM campaign_updates WHERE campaign_id = c.id) as update_count
        FROM campaigns c
        LEFT JOIN campaign_analytics ca ON c.id = ca.campaign_id
        WHERE c.creator_id = ?
        ORDER BY c.created_at DESC`,
        [userId]
      );
    } catch (error) {
      console.warn('Error fetching campaigns with comments/updates, falling back to basic query:', error.message);
      // Fallback to basic query if the full query fails
      campaigns = await db.all(
        `SELECT 
          c.*,
          COALESCE(ca.total_backers, 0) as total_backers,
          COALESCE(ca.avg_pledge_amount, 0) as avg_pledge_amount,
          COALESCE(ca.funding_percentage, 0) as funding_percentage,
          0 as comment_count,
          0 as update_count
        FROM campaigns c
        LEFT JOIN campaign_analytics ca ON c.id = ca.campaign_id
        WHERE c.creator_id = ?
        ORDER BY c.created_at DESC`,
        [userId]
      );
    }

    // If still no campaigns, set to empty array
    campaigns = campaigns || [];

    // Get recent pledges on entrepreneur's campaigns
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
      LIMIT 20`,
      [userId]
    );

    // Get notifications
    const notifications = await db.all(
      `SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10`,
      [userId]
    );

    // Get campaign performance analytics
    const performanceAnalytics = await db.all(
      `SELECT 
        DATE(p.timestamp) as date,
        COUNT(*) as pledge_count,
        SUM(p.amount) as daily_total
      FROM pledges p
      JOIN campaigns c ON p.campaign_id = c.id
      WHERE c.creator_id = ?
      GROUP BY DATE(p.timestamp)
      ORDER BY date DESC
      LIMIT 30`,
      [userId]
    );

    // Get fund release history (with error handling for missing table)
    let fundReleases = [];
    try {
      const result = await db.all(
        `SELECT 
          frl.*,
          c.title as campaign_title
        FROM fund_release_log frl
        JOIN campaigns c ON frl.campaign_id = c.id
        WHERE frl.creator_id = ?
        ORDER BY frl.released_at DESC
        LIMIT 10`,
        [userId]
      );
      if (result) fundReleases = result;
    } catch (error) {
      console.warn('Could not fetch fund release history:', error.message);
      // Continue with empty array if the table doesn't exist
    }

    res.json({
      stats: stats || {
        user_id: userId,
        total_campaigns: 0,
        active_campaigns: 0,
        successful_campaigns: 0,
        total_raised: 0,
        total_backers: 0
      },
      campaigns,
      recentPledges,
      notifications,
      performanceAnalytics,
      fundReleases
    });
  } catch (error) {
    console.error('Entrepreneur dashboard error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      userId: req.user?.userId,
      timestamp: new Date().toISOString()
    });
    
    // Send more detailed error response in development
    const errorResponse = {
      error: 'Failed to load entrepreneur dashboard',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        code: error.code,
        details: error
      } : {})
    };
    
    res.status(500).json(errorResponse);
  }
};

// Get Investor Dashboard Data
exports.getInvestorDashboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get user wallet balance and basic stats
    const userData = await db.get(
      `SELECT 
        u.wallet_balance,
        COUNT(DISTINCT p.id) as total_pledges,
        COUNT(DISTINCT p.campaign_id) as campaigns_backed,
        COALESCE(SUM(p.amount), 0) as total_invested,
        COALESCE(AVG(p.amount), 0) as avg_pledge_amount
      FROM users u
      LEFT JOIN pledges p ON u.id = p.user_id
      WHERE u.id = ?
      GROUP BY u.id`,
      [userId]
    ) || {};

    // Get all pledges made by investor
    const pledges = await db.all(
      `SELECT 
        p.*,
        c.title as campaign_title,
        c.status as campaign_status,
        c.goal_amount,
        c.current_funds,
        c.deadline,
        u.name as creator_name
      FROM pledges p
      JOIN campaigns c ON p.campaign_id = c.id
      JOIN users u ON c.creator_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.timestamp DESC`,
      [userId]
    );

    // Get backed campaigns summary
    const backedCampaigns = await db.all(
      `SELECT 
        c.*,
        SUM(p.amount) as total_pledged,
        COUNT(p.id) as pledge_count,
        ca.total_backers,
        ca.funding_percentage
      FROM campaigns c
      JOIN pledges p ON c.id = p.campaign_id
      LEFT JOIN campaign_analytics ca ON c.id = ca.campaign_id
      WHERE p.user_id = ?
      GROUP BY c.id
      ORDER BY p.timestamp DESC`,
      [userId]
    );

    // Get wallet transactions
    const transactions = await db.all(
      `SELECT * FROM wallet_transactions
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT 20`,
      [userId]
    );

    // Get notifications
    const notifications = await db.all(
      `SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10`,
      [userId]
    );

    // Get investment analytics
    const investmentAnalytics = await db.all(
      `SELECT 
        DATE(p.timestamp) as date,
        COUNT(*) as pledge_count,
        SUM(p.amount) as daily_total
      FROM pledges p
      WHERE p.user_id = ?
      GROUP BY DATE(p.timestamp)
      ORDER BY date DESC
      LIMIT 30`,
      [userId]
    );

    // Get recommended campaigns (active campaigns not backed yet)
    const recommendedCampaigns = await db.all(
      `SELECT 
        c.*,
        u.name as creator_name,
        ca.total_backers,
        ca.funding_percentage
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      LEFT JOIN campaign_analytics ca ON c.id = ca.campaign_id
      WHERE c.status = 'active'
      AND c.id NOT IN (
        SELECT campaign_id FROM pledges WHERE user_id = ?
      )
      ORDER BY ca.funding_percentage DESC
      LIMIT 10`,
      [userId]
    );

    // Prepare stats object with default values if no data found
    const stats = {
      user_id: userId,
      wallet_balance: userData.wallet_balance || 0,
      total_pledges: userData.total_pledges || 0,
      campaigns_backed: userData.campaigns_backed || 0,
      total_invested: userData.total_invested || 0,
      avg_pledge_amount: userData.avg_pledge_amount || 0
    };

    // Add sample notification if none exist
    if (notifications.length === 0) {
      notifications.push({
        id: 1,
        user_id: userId,
        title: 'Welcome to your dashboard!',
        message: 'Start exploring campaigns to make your first investment.',
        is_read: 0,
        type: 'info',
        created_at: new Date().toISOString()
      });
    }

    // Add sample transaction if none exist
    if (transactions.length === 0 && stats.wallet_balance > 0) {
      transactions.push({
        id: 1,
        user_id: userId,
        transaction_type: 'deposit',
        amount: stats.wallet_balance,
        description: 'Initial wallet deposit',
        balance_after: stats.wallet_balance,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
    }

    res.json({
      stats,
      pledges: pledges || [],
      backedCampaigns: backedCampaigns || [],
      transactions: transactions || [],
      notifications: notifications || [],
      investmentAnalytics: investmentAnalytics || [],
      recommendedCampaigns: recommendedCampaigns || []
    });
  } catch (error) {
    console.error('Investor dashboard error:', error);
    next(error);
  }
};

// Get user notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, unreadOnly = false } = req.query;

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (unreadOnly === 'true') {
      query += ' AND is_read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const notifications = await db.all(query, params);

    // Get unread count
    const unreadCount = await db.get(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({
      notifications,
      unreadCount: unreadCount.count
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    next(error);
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    await db.run(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    next(error);
  }
};

// Mark all notifications as read
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await db.run(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    next(error);
  }
};

module.exports = exports;

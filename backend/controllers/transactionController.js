const db = require('../database/dbHelper');

// Get transactions by user
exports.getTransactionsByUser = (req, res, next) => {
  try {
    const { userId } = req.params;

    const transactions = db.prepare(`
      SELECT 
        t.*,
        p.amount,
        p.timestamp as pledge_timestamp,
        c.title as campaign_title,
        c.status as campaign_status,
        c.goal_amount,
        c.total_pledged
      FROM transactions t
      LEFT JOIN pledges p ON t.pledge_id = p.id
      LEFT JOIN campaigns c ON p.campaign_id = c.id
      WHERE p.user_id = ?
      ORDER BY t.processed_at DESC, p.timestamp DESC
    `).all(userId);

    res.json({ transactions });
  } catch (error) {
    next(error);
  }
};

// Get all transactions (admin view)
exports.getAllTransactions = (req, res, next) => {
  try {
    const transactions = db.prepare(`
      SELECT 
        t.*,
        p.amount,
        p.timestamp as pledge_timestamp,
        p.user_id,
        u.name as user_name,
        c.id as campaign_id,
        c.title as campaign_title,
        c.status as campaign_status
      FROM transactions t
      LEFT JOIN pledges p ON t.pledge_id = p.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN campaigns c ON p.campaign_id = c.id
      ORDER BY t.processed_at DESC, p.timestamp DESC
    `).all();

    res.json({ transactions });
  } catch (error) {
    next(error);
  }
};

// Get transaction statistics
exports.getTransactionStats = (req, res, next) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(CASE WHEN status = 'committed' THEN 1 END) as committed_count,
        COUNT(CASE WHEN status = 'rolled_back' THEN 1 END) as rolled_back_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        SUM(CASE WHEN status = 'committed' THEN p.amount ELSE 0 END) as total_committed_amount,
        SUM(CASE WHEN status = 'rolled_back' THEN p.amount ELSE 0 END) as total_rolled_back_amount
      FROM transactions t
      LEFT JOIN pledges p ON t.pledge_id = p.id
    `).get();

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

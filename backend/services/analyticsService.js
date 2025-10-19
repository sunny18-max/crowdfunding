const db = require('../database/dbHelper');

/**
 * ANALYTICS SERVICE - Advanced SQL Queries & Aggregations
 * 
 * Demonstrates:
 * - Complex JOIN operations
 * - GROUP BY and HAVING clauses
 * - Aggregate functions (SUM, AVG, COUNT, MIN, MAX)
 * - Subqueries and CTEs
 * - Window functions
 * - Data analysis queries
 */

class AnalyticsService {

  /**
   * Get top 5 campaigns by funding
   * Demonstrates: Aggregation, JOIN, ORDER BY, LIMIT
   */
  static async getTopCampaigns(limit = 5) {
    return await db.all(`
      SELECT 
        c.id,
        c.title,
        c.goal_amount,
        c.total_pledged as current_funds,
        c.status,
        (c.total_pledged * 100.0 / c.goal_amount) as funding_percentage,
        COUNT(DISTINCT p.id) as total_backers,
        AVG(p.amount) as avg_pledge,
        u.name as creator_name
      FROM campaigns c
      LEFT JOIN pledges p ON c.id = p.campaign_id
      LEFT JOIN users u ON c.creator_id = u.id
      GROUP BY c.id
      ORDER BY c.total_pledged DESC
      LIMIT ?
    `, [limit]);
  }

  /**
   * Get campaigns that failed due to low pledges
   * Demonstrates: WHERE with complex conditions, HAVING clause
   */
  static async getFailedCampaigns() {
    return await db.all(`
      SELECT 
        c.id,
        c.title,
        c.goal_amount,
        c.total_pledged as current_funds,
        c.deadline,
        (c.total_pledged * 100.0 / c.goal_amount) as funding_percentage,
        COUNT(p.id) as backer_count,
        c.goal_amount - c.total_pledged as shortfall
      FROM campaigns c
      LEFT JOIN pledges p ON c.id = p.campaign_id
      WHERE c.status = 'failed'
      GROUP BY c.id
      HAVING c.total_pledged < c.goal_amount
      ORDER BY funding_percentage DESC
    `);
  }

  /**
   * Calculate average pledge per backer
   * Demonstrates: Multiple aggregations, subqueries
   */
  static async getAveragePledgeStats() {
    return await db.get(`
      SELECT 
        COUNT(DISTINCT user_id) as total_backers,
        COUNT(*) as total_pledges,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as avg_pledge_amount,
        COALESCE(MIN(amount), 0) as min_pledge,
        COALESCE(MAX(amount), 0) as max_pledge,
        (SELECT AVG(pledge_count) FROM (
          SELECT COUNT(*) as pledge_count 
          FROM pledges 
          GROUP BY user_id
        )) as avg_pledges_per_user
      FROM pledges
    `);
  }

  /**
   * Get campaign performance metrics
   * Demonstrates: Complex calculations, date functions
   */
  static async getCampaignPerformance(campaignId) {
    const performance = await db.get(`
      SELECT 
        c.*,
        COUNT(DISTINCT p.id) as total_backers,
        COUNT(DISTINCT p.user_id) as unique_backers,
        SUM(p.amount) as total_pledged,
        AVG(p.amount) as avg_pledge,
        MIN(p.amount) as min_pledge,
        MAX(p.amount) as max_pledge,
        (c.total_pledged * 100.0 / c.goal_amount) as funding_percentage,
        julianday(c.deadline) - julianday('now') as days_remaining,
        julianday('now') - julianday(c.created_at) as campaign_age_days,
        (c.total_pledged / (julianday('now') - julianday(c.created_at))) as avg_daily_funding
      FROM campaigns c
      LEFT JOIN pledges p ON c.id = p.campaign_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [campaignId]);

    // Get pledge timeline
    const timeline = await db.all(`
      SELECT 
        DATE(timestamp) as pledge_date,
        COUNT(*) as pledge_count,
        SUM(amount) as daily_total
      FROM pledges
      WHERE campaign_id = ?
      GROUP BY DATE(timestamp)
      ORDER BY pledge_date
    `, [campaignId]);

    return {
      performance,
      timeline
    };
  }

  /**
   * Get user engagement statistics
   * Demonstrates: Complex JOIN, multiple aggregations
   */
  static async getUserEngagementStats() {
    return await db.all(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.wallet_balance,
        COUNT(DISTINCT c.id) as campaigns_created,
        COUNT(DISTINCT p.id) as pledges_made,
        COALESCE(SUM(p.amount), 0) as total_pledged,
        COALESCE(SUM(CASE WHEN c2.status = 'successful' THEN c2.total_pledged ELSE 0 END), 0) as total_raised,
        (SELECT COUNT(*) FROM pledges p2 WHERE p2.user_id = u.id) as successful_pledges,
        0 as refunded_pledges
      FROM users u
      LEFT JOIN campaigns c ON u.id = c.creator_id
      LEFT JOIN pledges p ON u.id = p.user_id
      LEFT JOIN campaigns c2 ON c2.creator_id = u.id
      GROUP BY u.id
      ORDER BY total_pledged DESC
    `);
  }

  /**
   * Get funding trends over time
   * Demonstrates: Date grouping, time-series analysis
   */
  static async getFundingTrends(days = 30) {
    return await db.all(`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as pledge_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        COUNT(DISTINCT user_id) as unique_backers,
        COUNT(DISTINCT campaign_id) as active_campaigns
      FROM pledges
      WHERE timestamp >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `, [days]);
  }

  /**
   * Get category-wise campaign success rate
   * Demonstrates: CASE statements, percentage calculations
   */
  static async getCampaignSuccessRates() {
    return await db.get(`
      SELECT 
        COUNT(*) as total_campaigns,
        SUM(CASE WHEN status = 'successful' THEN 1 ELSE 0 END) as successful_count,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
        ROUND(SUM(CASE WHEN status = 'successful' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate,
        AVG(CASE WHEN status = 'successful' THEN total_pledged ELSE NULL END) as avg_successful_amount,
        AVG(CASE WHEN status = 'failed' THEN total_pledged ELSE NULL END) as avg_failed_amount
      FROM campaigns
    `);
  }

  /**
   * Predict campaign success probability
   * Demonstrates: Statistical analysis, predictive scoring
   */
  static async predictCampaignSuccess(campaignId) {
    const campaign = await db.get(`
      SELECT 
        c.*,
        COUNT(p.id) as current_backers,
        julianday(c.deadline) - julianday('now') as days_remaining,
        julianday('now') - julianday(c.created_at) as days_elapsed,
        (c.total_pledged * 1.0 / c.goal_amount) as funding_ratio
      FROM campaigns c
      LEFT JOIN pledges p ON c.id = p.campaign_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [campaignId]);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Simple prediction algorithm based on historical data
    const historicalSuccess = await db.get(`
      SELECT 
        AVG(CASE WHEN status = 'successful' THEN 1 ELSE 0 END) as base_success_rate,
        AVG(CASE WHEN status = 'successful' THEN 
          julianday(deadline) - julianday(created_at) 
        ELSE NULL END) as avg_successful_duration
      FROM campaigns
      WHERE status IN ('successful', 'failed')
    `);

    // Calculate prediction score (0-100)
    let score = 0;
    
    // Factor 1: Current funding ratio (40% weight)
    score += campaign.funding_ratio * 40;
    
    // Factor 2: Backer momentum (30% weight)
    const backersPerDay = campaign.current_backers / Math.max(campaign.days_elapsed, 1);
    const daysRemaining = Math.max(campaign.days_remaining, 0);
    const projectedBackers = campaign.current_backers + (backersPerDay * daysRemaining);
    score += Math.min((projectedBackers / 10) * 30, 30); // Assume 10 backers is good
    
    // Factor 3: Time remaining (20% weight)
    if (campaign.days_remaining > 0) {
      const timeScore = Math.min(campaign.days_remaining / 30, 1) * 20;
      score += timeScore;
    }
    
    // Factor 4: Historical success rate (10% weight)
    score += historicalSuccess.base_success_rate * 10;

    return {
      campaign_id: campaignId,
      prediction_score: Math.min(Math.round(score), 100),
      funding_ratio: Math.round(campaign.funding_ratio * 100),
      days_remaining: Math.max(Math.round(campaign.days_remaining), 0),
      current_backers: campaign.current_backers,
      projected_outcome: score >= 70 ? 'Likely to succeed' : score >= 40 ? 'Uncertain' : 'Likely to fail',
      confidence: score >= 70 || score <= 30 ? 'High' : 'Medium',
      recommendations: this.generateRecommendations(campaign, score)
    };
  }

  /**
   * Generate recommendations for campaign improvement
   */
  static generateRecommendations(campaign, score) {
    const recommendations = [];
    
    if (campaign.funding_ratio < 0.5) {
      recommendations.push('Increase marketing efforts to attract more backers');
    }
    
    if (campaign.current_backers < 5) {
      recommendations.push('Reach out to your network for initial support');
    }
    
    if (campaign.days_remaining < 7 && campaign.funding_ratio < 0.8) {
      recommendations.push('Consider extending deadline or lowering goal');
    }
    
    if (campaign.current_backers > 0 && campaign.funding_ratio < 0.3) {
      recommendations.push('Engage with existing backers to spread the word');
    }

    return recommendations;
  }

  /**
   * Get wallet transaction analytics
   * Demonstrates: Transaction analysis, balance tracking
   */
  static async getWalletAnalytics(userId) {
    const summary = await db.get(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END) as total_debits,
        SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END) as total_credits,
        SUM(CASE WHEN transaction_type = 'refund' THEN amount ELSE 0 END) as total_refunds,
        AVG(amount) as avg_transaction_amount,
        MAX(amount) as largest_transaction,
        MIN(timestamp) as first_transaction,
        MAX(timestamp) as last_transaction
      FROM wallet_transactions
      WHERE user_id = ?
    `, [userId]);

    const monthlyTrend = await db.all(`
      SELECT 
        strftime('%Y-%m', timestamp) as month,
        COUNT(*) as transaction_count,
        SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END) as debits,
        SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END) as credits
      FROM wallet_transactions
      WHERE user_id = ?
      GROUP BY strftime('%Y-%m', timestamp)
      ORDER BY month DESC
      LIMIT 12
    `, [userId]);

    return {
      summary,
      monthlyTrend
    };
  }

  /**
   * Get audit log report
   * Demonstrates: Audit trail analysis
   */
  static async getAuditReport(tableFilter = null, days = 7) {
    let query = `
      SELECT 
        al.*,
        u.name as changed_by_name
      FROM audit_log al
      LEFT JOIN users u ON al.changed_by = u.id
      WHERE al.timestamp >= datetime('now', '-' || ? || ' days')
    `;
    
    const params = [days];
    
    if (tableFilter) {
      query += ' AND al.table_name = ?';
      params.push(tableFilter);
    }
    
    query += ' ORDER BY al.timestamp DESC LIMIT 100';

    return await db.all(query, params);
  }

  /**
   * Get platform-wide statistics dashboard
   * Demonstrates: Comprehensive data aggregation
   */
  static async getPlatformStats() {
    const stats = await db.get(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM campaigns) as total_campaigns,
        (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as active_campaigns,
        (SELECT COUNT(*) FROM campaigns WHERE status = 'successful') as successful_campaigns,
        (SELECT COALESCE(SUM(total_pledged), 0) FROM campaigns WHERE status = 'successful') as total_funds_raised,
        (SELECT COUNT(*) FROM pledges) as total_pledges,
        (SELECT COALESCE(SUM(amount), 0) FROM pledges) as total_pledged_amount,
        (SELECT COALESCE(AVG(wallet_balance), 0) FROM users) as avg_user_balance,
        (SELECT COUNT(DISTINCT user_id) FROM pledges) as active_backers
    `);

    return stats;
  }
}

module.exports = AnalyticsService;

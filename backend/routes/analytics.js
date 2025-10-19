const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AnalyticsService = require('../services/analyticsService');

// Get top campaigns
router.get('/top-campaigns', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const campaigns = await AnalyticsService.getTopCampaigns(limit);
    res.json({ campaigns });
  } catch (error) {
    next(error);
  }
});

// Get failed campaigns
router.get('/failed-campaigns', async (req, res, next) => {
  try {
    const campaigns = await AnalyticsService.getFailedCampaigns();
    res.json({ campaigns });
  } catch (error) {
    next(error);
  }
});

// Get average pledge statistics
router.get('/pledge-stats', async (req, res, next) => {
  try {
    const stats = await AnalyticsService.getAveragePledgeStats();
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

// Get campaign performance
router.get('/campaign-performance/:campaignId', async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const performance = await AnalyticsService.getCampaignPerformance(parseInt(campaignId));
    res.json(performance);
  } catch (error) {
    next(error);
  }
});

// Get user engagement stats
router.get('/user-engagement', auth, async (req, res, next) => {
  try {
    const stats = await AnalyticsService.getUserEngagementStats();
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

// Get funding trends
router.get('/funding-trends', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const trends = await AnalyticsService.getFundingTrends(days);
    res.json({ trends });
  } catch (error) {
    next(error);
  }
});

// Get campaign success rates
router.get('/success-rates', async (req, res, next) => {
  try {
    const rates = await AnalyticsService.getCampaignSuccessRates();
    res.json({ rates });
  } catch (error) {
    next(error);
  }
});

// Predict campaign success
router.get('/predict/:campaignId', async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const prediction = await AnalyticsService.predictCampaignSuccess(parseInt(campaignId));
    res.json({ prediction });
  } catch (error) {
    next(error);
  }
});

// Get wallet analytics
router.get('/wallet/:userId', auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const analytics = await AnalyticsService.getWalletAnalytics(parseInt(userId));
    res.json({ analytics });
  } catch (error) {
    next(error);
  }
});

// Get audit report
router.get('/audit-log', auth, async (req, res, next) => {
  try {
    const { table, days } = req.query;
    const report = await AnalyticsService.getAuditReport(
      table || null,
      parseInt(days) || 7
    );
    res.json({ report });
  } catch (error) {
    next(error);
  }
});

// Get platform statistics
router.get('/platform-stats', async (req, res, next) => {
  try {
    const stats = await AnalyticsService.getPlatformStats();
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

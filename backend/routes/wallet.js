const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WalletService = require('../services/walletService');

// Get wallet info
router.get('/:userId', auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Ensure user can only access their own wallet
    if (parseInt(userId) !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const walletInfo = await WalletService.getWalletInfo(userId);
    res.json(walletInfo);
  } catch (error) {
    next(error);
  }
});

// Add funds to wallet (for testing/demo)
router.post('/:userId/add-funds', auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const result = await WalletService.addFunds(parseInt(userId), parseFloat(amount));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Create pledge with wallet (ACID transaction demo)
router.post('/pledge', auth, async (req, res, next) => {
  try {
    const { campaign_id, amount } = req.body;
    const user_id = req.user.userId;

    if (!campaign_id || !amount) {
      return res.status(400).json({ error: 'Campaign ID and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const result = await WalletService.createPledgeWithWallet(
      user_id,
      campaign_id,
      parseFloat(amount)
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Process campaign completion (admin/cron)
router.post('/process-campaign/:campaignId', auth, async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    
    const result = await WalletService.processCampaignCompletion(parseInt(campaignId));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Demonstrate concurrency control
router.post('/demo-concurrency', auth, async (req, res, next) => {
  try {
    const { campaign_id, amount } = req.body;
    const user_id = req.user.userId;

    const result = await WalletService.demonstrateConcurrency(
      user_id,
      campaign_id,
      parseFloat(amount)
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

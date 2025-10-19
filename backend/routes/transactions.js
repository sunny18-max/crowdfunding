const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const { manualProcessExpiredCampaigns } = require('../services/deadlineChecker');

// Protected routes
router.get('/user/:userId', auth, transactionController.getTransactionsByUser);
router.get('/all', auth, transactionController.getAllTransactions);
router.get('/stats', auth, transactionController.getTransactionStats);

// Manual trigger for processing expired campaigns (for testing/admin)
router.post('/process-expired', auth, async (req, res, next) => {
  try {
    const result = await manualProcessExpiredCampaigns();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

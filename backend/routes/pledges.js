const express = require('express');
const router = express.Router();
const pledgeController = require('../controllers/pledgeController');
const auth = require('../middleware/auth');

// All pledge routes require authentication
router.post('/', auth, pledgeController.createPledge);
router.get('/user/:userId', auth, pledgeController.getPledgesByUser);
router.get('/campaign/:campaignId', pledgeController.getPledgesByCampaign);
router.get('/user/:userId/stats', auth, pledgeController.getUserPledgeStats);

module.exports = router;

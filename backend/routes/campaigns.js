const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', campaignController.getAllCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.get('/user/:userId', campaignController.getCampaignsByUser);

// Protected routes
router.post('/', auth, campaignController.createCampaign);
router.put('/:id', auth, campaignController.updateCampaign);
router.delete('/:id', auth, campaignController.deleteCampaign);

module.exports = router;

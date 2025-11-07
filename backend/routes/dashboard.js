const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const { requireAdmin, requireEntrepreneur, requireInvestor } = require('../middleware/roleAuth');

// Admin dashboard
router.get('/admin', auth, requireAdmin, dashboardController.getAdminDashboard);

// Entrepreneur dashboard
router.get('/entrepreneur', auth, requireEntrepreneur, dashboardController.getEntrepreneurDashboard);

// Investor dashboard
router.get('/investor', auth, requireInvestor, dashboardController.getInvestorDashboard);

// Notifications (all roles)
router.get('/notifications', auth, dashboardController.getNotifications);
router.put('/notifications/:notificationId/read', auth, dashboardController.markNotificationRead);
router.put('/notifications/read-all', auth, dashboardController.markAllNotificationsRead);

module.exports = router;

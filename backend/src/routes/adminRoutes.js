const express = require('express');
const { getDashboardStats, getEventAnalytics, getPendingEvents, updateEventStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/analytics', protect, adminOnly, getEventAnalytics);
router.get('/pending-events', protect, adminOnly, getPendingEvents);
router.put('/event-status/:id', protect, adminOnly, updateEventStatus);

module.exports = router;
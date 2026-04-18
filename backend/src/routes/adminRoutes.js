const express = require('express');
const { getDashboardStats, getEventAnalytics } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/analytics', protect, adminOnly, getEventAnalytics);

module.exports = router;
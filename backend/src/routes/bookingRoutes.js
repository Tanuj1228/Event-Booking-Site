const express = require('express');
const { lockSeat, bookTickets } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/lock', protect, lockSeat);
router.post('/book', protect, bookTickets);

module.exports = router;
const express = require('express');
const { lockSeat, bookTickets, getMyBookings } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/lock', protect, lockSeat);
router.post('/book', protect, bookTickets);
router.get('/mybookings', protect, getMyBookings);

module.exports = router;
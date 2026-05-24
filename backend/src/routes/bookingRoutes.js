const express = require('express');
const { lockSeat, bookTickets, getMyBookings } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Route to lock a seat temporarily
router.post('/lock', protect, lockSeat);

// Route to confirm a booking
router.post('/', protect, bookTickets);

// Route to get a student's bookings (THIS IS THE ONE THAT WAS MISSING/404)
router.get('/my-bookings', protect, getMyBookings);

module.exports = router;
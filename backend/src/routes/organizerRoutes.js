const express = require('express');
const { getMyEvents, exportAttendees, checkInTicket } = require('../controllers/organizerController');
const { protect, organizerOrAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/my-events', protect, organizerOrAdmin, getMyEvents);
router.get('/export/:eventId', protect, organizerOrAdmin, exportAttendees);
router.post('/check-in', protect, organizerOrAdmin, checkInTicket);

module.exports = router;
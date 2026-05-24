const express = require('express');
const { createEvent, getEvents, getEventById } = require('../controllers/eventController');
const { protect, organizerOrAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/')
    .get(getEvents)
    .post(protect, organizerOrAdmin, createEvent);

router.get('/:id', getEventById);

module.exports = router;
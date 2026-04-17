const express = require('express');
const { createEvent, getEvents, getEventById } = require('../controllers/eventController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/')
    .get(getEvents)
    .post(protect, adminOnly, createEvent);

router.route('/:id')
    .get(getEventById);

module.exports = router;
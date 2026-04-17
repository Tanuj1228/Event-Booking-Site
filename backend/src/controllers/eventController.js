const Event = require('../models/Event');

const createEvent = async (req, res) => {
    try {
        const { name, venue, date, category, price, totalSeats } = req.body;
        
        const seats = [];
        for (let i = 1; i <= totalSeats; i++) {
            seats.push({ seatNumber: `S${i}`, isAvailable: true });
        }

        const event = await Event.create({
            name, venue, date, category, price, seats
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEvents = async (req, res) => {
    try {
        const events = await Event.find().select('-seats');
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createEvent, getEvents, getEventById };
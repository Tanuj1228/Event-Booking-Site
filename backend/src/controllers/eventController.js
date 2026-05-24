const Event = require('../models/Event');

const createEvent = async (req, res) => {
    const { name, venue, date, category, price, totalSeats } = req.body;
    try {
        let seats = [];
        for (let i = 1; i <= totalSeats; i++) {
            seats.push({ seatNumber: `S${i}` });
        }

        const event = await Event.create({
            name, venue, date, category, price, totalSeats, seats,
            organizer: req.user.id,
            status: req.user.role === 'admin' ? 'approved' : 'pending' 
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'approved' }).select('-seats');
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        
        if (event.status !== 'approved' && (!req.user || (req.user.role !== 'admin' && req.user.id !== event.organizer.toString()))) {
            return res.status(403).json({ message: 'Event not available' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createEvent, getEvents, getEventById };
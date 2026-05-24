const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const QRCode = require('qrcode');
const { sendBookingConfirmation } = require('../services/emailService');

const lockSeat = async (req, res) => {
    const { eventId, seatNumber } = req.body;
    const userId = req.user.id.toString();

    try {
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const seat = event.seats.find(s => s.seatNumber === seatNumber);
        if (!seat) return res.status(404).json({ message: 'Seat not found' });

        if (!seat.isAvailable) {
            return res.status(400).json({ message: 'Seat is already booked' });
        }

        if (seat.lockedBy && seat.lockedBy !== userId && seat.lockExpiration > new Date()) {
            return res.status(400).json({ message: 'Seat is currently locked by another user' });
        }

        seat.lockedBy = userId;
        seat.lockExpiration = new Date(Date.now() + 5 * 60 * 1000); 
        await event.save();
        
        const io = req.app.get('io');
        io.emit('seatUpdate', { eventId, seatNumber, status: 'locked' });

        res.status(200).json({ message: 'Seat locked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const bookTickets = async (req, res) => {
    const { eventId, seats, totalAmount } = req.body;
    const userId = req.user.id.toString();

    try {
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        for (let seatNumber of seats) {
            const seat = event.seats.find(s => s.seatNumber === seatNumber);
            if (!seat || !seat.isAvailable) {
                return res.status(400).json({ message: `Seat ${seatNumber} is unavailable` });
            }
            
            if (!seat.lockedBy || seat.lockedBy !== userId || seat.lockExpiration < new Date()) {
                return res.status(400).json({ message: `Seat ${seatNumber} lock expired or invalid` });
            }
        }

        for (let seatNumber of seats) {
            const seat = event.seats.find(s => s.seatNumber === seatNumber);
            if (seat) {
                seat.isAvailable = false;
                seat.lockedBy = userId;
                seat.lockExpiration = null; 
            }
        }
        await event.save();

        const booking = await Booking.create({
            user: userId,
            event: eventId,
            seats,
            totalAmount,
            status: 'confirmed'
        });

        const io = req.app.get('io');
        io.emit('seatUpdate', { eventId, seats, status: 'booked' });

        try {
            const user = await User.findById(userId);
            if (user && process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
                const qrCodeDataURI = await QRCode.toDataURL(booking._id.toString());
                await sendBookingConfirmation(user.email, user.name, event.name, seats, totalAmount, qrCodeDataURI);
            }
        } catch (emailError) {
            console.error('Email error:', emailError);
        }

        res.status(201).json(booking);
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('event', 'name venue date category')
            .sort('-createdAt');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { lockSeat, bookTickets, getMyBookings };
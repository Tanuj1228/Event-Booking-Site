const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { redisClient } = require('../config/redis');
const { sendBookingConfirmation } = require('../services/emailService');

const lockSeat = async (req, res) => {
    const { eventId, seatNumber } = req.body;
    const userId = req.user.id.toString();
    const lockKey = `lock:${eventId}:${seatNumber}`;

    try {
        const isLocked = await redisClient.get(lockKey);
        if (isLocked && isLocked !== userId) {
            return res.status(400).json({ message: 'Seat is currently locked by another user' });
        }

        await redisClient.setEx(lockKey, 300, userId); 
        
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
            const lockKey = `lock:${eventId}:${seatNumber}`;
            const lockedBy = await redisClient.get(lockKey);
            
            if (lockedBy && lockedBy !== userId) {
                return res.status(400).json({ message: `Seat ${seatNumber} lock expired or invalid` });
            }
        }

        for (let seatNumber of seats) {
            const seatIndex = event.seats.findIndex(s => s.seatNumber === seatNumber);
            if (seatIndex !== -1) {
                event.seats[seatIndex].isAvailable = false;
                event.seats[seatIndex].lockedBy = userId;
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

        for (let seatNumber of seats) {
            const lockKey = `lock:${eventId}:${seatNumber}`;
            await redisClient.del(lockKey);
        }

        const io = req.app.get('io');
        io.emit('seatUpdate', { eventId, seats, status: 'booked' });

        try {
            const user = await User.findById(userId);
            if (user && process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
                await sendBookingConfirmation(user.email, user.name, event.name, seats, totalAmount);
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
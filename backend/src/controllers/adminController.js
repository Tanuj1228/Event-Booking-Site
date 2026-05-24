const Booking = require('../models/Booking');
const User = require('../models/User');
const Event = require('../models/Event');

const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'student' });
        const totalEvents = await Event.countDocuments({ status: 'approved' });
        const totalBookings = await Booking.countDocuments();
        
        const revenueResult = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        res.status(200).json({ totalUsers, totalEvents, totalBookings, totalRevenue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEventAnalytics = async (req, res) => {
    try {
        const analytics = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { 
                _id: '$event', 
                ticketsSold: { $sum: { $size: '$seats' } }, 
                revenue: { $sum: '$totalAmount' } 
            }},
            { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'eventData' } },
            { $unwind: '$eventData' },
            { $project: { _id: 0, eventName: '$eventData.name', ticketsSold: 1, revenue: 1 } }
        ]);
        res.status(200).json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'pending' }).populate('organizer', 'name email');
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateEventStatus = async (req, res) => {
    const { status } = req.body; 
    try {
        if (!['approved', 'rejected'].includes(status)) {
             return res.status(400).json({ message: 'Invalid status' });
        }
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.status = status;
        await event.save();
        res.status(200).json({ message: `Event ${status} successfully`, event });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats, getEventAnalytics, getPendingEvents, updateEventStatus };
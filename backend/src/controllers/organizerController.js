const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { Parser } = require('json2csv');

const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user.id });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportAttendees = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        
        // Ensure this organizer owns the event
        const event = await Event.findOne({ _id: eventId, organizer: req.user.id });
        if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

        const bookings = await Booking.find({ event: eventId, status: 'confirmed' }).populate('user', 'name email');
        
        const data = bookings.map(b => ({
            Ticket_ID: b._id.toString(),
            Student_Name: b.user.name,
            Email: b.user.email,
            Seats: b.seats.join(', '),
            Amount_Paid: `Rs. ${b.totalAmount}`,
            Checked_In: b.checkedIn ? 'Yes' : 'No',
            Booking_Date: new Date(b.createdAt).toLocaleDateString()
        }));

        if (data.length === 0) return res.status(400).json({ message: 'No attendees found yet' });

        const parser = new Parser();
        const csv = parser.parse(data);

        res.header('Content-Type', 'text/csv');
        res.attachment(`${event.name.replace(/\s+/g, '_')}_Attendees.csv`);
        return res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const checkInTicket = async (req, res) => {
    try {
        const { bookingId } = req.body;
        
        const booking = await Booking.findById(bookingId).populate('event');
        if (!booking) return res.status(404).json({ message: 'Invalid Ticket QR Code' });

        // Verify the event belongs to this organizer
        if (booking.event.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized: This ticket is for a different event' });
        }

        if (booking.checkedIn) {
            return res.status(400).json({ message: 'Ticket has ALREADY been scanned and checked in!' });
        }

        booking.checkedIn = true;
        await booking.save();

        res.status(200).json({ message: `Success! ${booking.seats.length} seats checked in.`, seats: booking.seats });
    } catch (error) {
        res.status(500).json({ message: 'Check-in failed. Invalid QR data.' });
    }
};

module.exports = { getMyEvents, exportAttendees, checkInTicket };
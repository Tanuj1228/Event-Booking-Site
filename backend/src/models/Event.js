const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    seatNumber: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    lockedBy: { type: String, default: null },
    lockExpiration: { type: Date, default: null } 
});

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    seats: [seatSchema],
    organizer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
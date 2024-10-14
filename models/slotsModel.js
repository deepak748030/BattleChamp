const mongoose = require('mongoose');

// Define the Slots schema
const slotsSchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AllGames', // Reference to the AllGames model
        required: true,
    },
    amount: {
        type: Number, // Entry fee amount
        required: true,
    },
    commission: {
        type: Number, // Commission for the contest
        required: true,
    },
    contestStartDate: {
        type: String, // Date in 'yyyy-mm-dd' format
        required: true,
    },
    matchStartTime: {
        type: String, // Time in '24hrs' format like '12:00' or '01:00'
        required: true,
    },
    matchEndTime: {
        type: String, // End time in '24hrs' format like '12:00' or '01:00'
        required: true,
    },
    availableSlots: {
        type: Number, // Number of available slots for the contest
        required: true,
    },
    totalSlots: {
        type: Number, // Total number of slots in the contest
        required: true,
    },
    contestStatus: {
        type: String, // Contest status (e.g., 'upcoming', 'live', 'completed', 'cancelled')
        enum: ['upcoming', 'live', 'completed', 'cancelled'], // Enum to restrict status to these values
        required: true,
        default: 'upcoming', // Default value is 'upcoming'
    }
}, { timestamps: true });

// Create the Slots (Contest) model
const Slots = mongoose.model('Slots', slotsSchema);

module.exports = Slots;

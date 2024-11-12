const mongoose = require('mongoose');

// Define the Contest schema (renamed from Slots)
const contestSchema = new mongoose.Schema({
    name: {
        type: String, // Name of the contest
        required: true,
    },
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
    },
    winByRank: [ // New winByRank field added
        {
            rank: {
                type: String, // Store rank as string "1-10", "11-20", etc.
                required: true,
            },
            amount: {
                type: Number, // The amount for this rank range
                required: true,
            }
        }
    ],
    betType: { // New betType field added
        type: String, // Type of bet (either "token" or "money")
        enum: ['token', 'money'], // Restrict values to "token" or "money"
        required: true
    }
}, { timestamps: true });

// Create the Contest model (renamed from Slots)
const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;

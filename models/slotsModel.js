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
    }
}, { timestamps: true });

// Create the Slots (Contest) model
const Slots = mongoose.model('Slots', slotsSchema);

module.exports = Slots;

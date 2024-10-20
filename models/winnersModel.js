const mongoose = require('mongoose');

// Define the Winners schema
const winnersSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true, // Ensure userId is required
    },
    winning: {
        type: Number, // Amount won
        required: true, // Ensure winning amount is required
    },
    date: {
        type: String, // Store date as a string in 'dd-mm-yyyy' format
        required: true,
    }
}, { timestamps: true }); // Include timestamps for createdAt and updatedAt

// Create the Winners model
const Winners = mongoose.model('Winners', winnersSchema);

module.exports = Winners;

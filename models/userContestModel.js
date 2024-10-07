const mongoose = require('mongoose');

// Define the UserContest schema
const userContestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slots', // Reference to the Slots model
        required: true,
    }
}, { timestamps: true });

// Create the UserContest model
const UserContest = mongoose.model('UserContest', userContestSchema);

module.exports = UserContest;
